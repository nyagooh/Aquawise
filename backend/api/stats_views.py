import statistics as pystats
from collections import defaultdict
from datetime import timedelta

from django.db.models import Case, IntegerField, Sum, When
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as http_status

from .models import Alert, TimeSeriesReading


# ── Parameter metadata ────────────────────────────────────────────────────────
# (db_field, display_label, unit, WHO_safe_min, WHO_safe_max)

PARAMS = [
    ('temperature',      'Temperature',      '°C',     15.0,  30.0),
    ('turbidity',        'Turbidity',        'NTU',     0.0,   5.0),
    ('ph',               'pH Level',         'pH',      6.5,   8.5),
    ('dissolved_oxygen', 'Dissolved Oxygen', 'mg/L',    6.0,  14.0),
    ('conductivity',     'Conductivity',     'µS/cm', 200.0, 800.0),
    ('nitrates',         'Nitrates',         'mg/L',    0.0,  10.0),
]
PARAM_FIELDS = {p[0] for p in PARAMS}

# Fixed histogram bucket edges per parameter
BUCKET_EDGES = {
    'ph':               [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0],
    'turbidity':        [0,   1,   2,   3,   4,   5,   7,   10],
    'nitrates':         [0,   2,   4,   6,   8,   10,  12],
    'temperature':      [10,  15,  20,  25,  30,  35],
    'dissolved_oxygen': [0,   4,   6,   8,   10,  12,  14],
    'conductivity':     [0,   200, 400, 600, 800, 1000],
}


# ── Shared helpers ────────────────────────────────────────────────────────────

def _parse_days(period, default=90):
    """'90d' → 90, '7d' → 7, anything else → default."""
    if period and period.endswith('d'):
        try:
            return max(1, int(period[:-1]))
        except ValueError:
            pass
    return default


def _readings_qs(days):
    return TimeSeriesReading.objects.filter(
        timestamp__gte=timezone.now() - timedelta(days=days)
    )


def _week_key(dt):
    """ISO 8601 week string, e.g. '2026-W18'."""
    return dt.strftime('%G-W%V')


def _build_buckets(values, edges):
    """Count values into the given histogram edges."""
    buckets = []
    for i in range(len(edges) - 1):
        lo, hi = edges[i], edges[i + 1]
        if i == len(edges) - 2:
            count = sum(1 for v in values if lo <= v <= hi)  # last bucket inclusive
        else:
            count = sum(1 for v in values if lo <= v < hi)
        buckets.append({'range': f'{lo}–{hi}', 'count': count})
    return buckets


def _auto_edges(values, n=8):
    """Generate n equal-width bucket edges from the observed range."""
    lo, hi = min(values), max(values)
    step = (hi - lo) / n if hi != lo else 1
    return [round(lo + i * step, 2) for i in range(n + 1)]


def _safe_stdev(vals):
    return round(pystats.stdev(vals), 3) if len(vals) > 1 else 0.0


# ── GET /api/statistics/summary?period=90d ────────────────────────────────────

@api_view(['GET'])
def statistics_summary(request):
    days = _parse_days(request.query_params.get('period'))
    since = timezone.now() - timedelta(days=days)
    qs = _readings_qs(days)
    total = qs.count()

    # A reading is WHO-compliant only if every tracked parameter is within range.
    # TimeSeriesReading has no nullable fields, so NULL is not a concern here.
    compliant = qs.aggregate(
        n=Sum(Case(
            When(
                temperature__gte=15,      temperature__lte=30,
                turbidity__gte=0,         turbidity__lte=5,
                ph__gte=6.5,              ph__lte=8.5,
                dissolved_oxygen__gte=6,  dissolved_oxygen__lte=14,
                conductivity__gte=200,    conductivity__lte=800,
                nitrates__gte=0,          nitrates__lte=10,
                then=1,
            ),
            default=0,
            output_field=IntegerField(),
        ))
    )['n'] or 0

    alerts_qs = Alert.objects.filter(created_at__gte=since)

    return Response({
        'period': f'{days}d',
        'totalReadings': total,
        'whoCompliancePercent': round(compliant / total * 100, 1) if total else 0.0,
        'alertsGenerated': alerts_qs.count(),
        'criticalEvents': alerts_qs.filter(risk='danger').count(),
    })


# ── GET /api/statistics/distribution?param=ph&period=90d ─────────────────────

@api_view(['GET'])
def statistics_distribution(request):
    param = request.query_params.get('param', 'ph')
    days = _parse_days(request.query_params.get('period'))

    if param not in PARAM_FIELDS:
        return Response(
            {'error': f'Unknown param "{param}". Valid: {", ".join(sorted(PARAM_FIELDS))}'},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    values = list(
        _readings_qs(days)
        .values_list(param, flat=True)
        .exclude(**{f'{param}__isnull': True})
    )

    edges = BUCKET_EDGES.get(param) or (_auto_edges(values) if values else [0, 1])

    return Response({
        'period': f'{days}d',
        'param': param,
        'totalValues': len(values),
        'buckets': _build_buckets(values, edges),
    })


# ── GET /api/statistics/compliance?period=90d ────────────────────────────────

@api_view(['GET'])
def statistics_compliance(request):
    days = _parse_days(request.query_params.get('period'))
    rows = list(
        _readings_qs(days).values(
            'timestamp', 'temperature', 'turbidity', 'ph',
            'dissolved_oxygen', 'conductivity', 'nitrates',
        )
    )

    # Per-parameter WHO summary table
    parameters = []
    for field, label, unit, safe_min, safe_max in PARAMS:
        vals = [r[field] for r in rows if r[field] is not None]
        if vals:
            compliant = sum(1 for v in vals if safe_min <= v <= safe_max)
            parameters.append({
                'param': field,
                'label': label,
                'unit': unit,
                'min': round(min(vals), 3),
                'max': round(max(vals), 3),
                'mean': round(pystats.mean(vals), 3),
                'stdDev': _safe_stdev(vals),
                'compliancePercent': round(compliant / len(vals) * 100, 1),
                'safeMin': safe_min,
                'safeMax': safe_max,
                'totalReadings': len(vals),
            })
        else:
            parameters.append({
                'param': field, 'label': label, 'unit': unit,
                'min': None, 'max': None, 'mean': None, 'stdDev': None,
                'compliancePercent': None,
                'safeMin': safe_min, 'safeMax': safe_max,
                'totalReadings': 0,
            })

    # Weekly compliance timeline — % of readings within safe range per parameter
    weekly_buckets = defaultdict(lambda: {f: [] for f, *_ in PARAMS})
    for r in rows:
        wk = _week_key(r['timestamp'])
        for field, *_ in PARAMS:
            if r[field] is not None:
                weekly_buckets[wk][field].append(r[field])

    timeline = []
    for wk in sorted(weekly_buckets):
        entry = {'week': wk}
        for field, _, _, safe_min, safe_max in PARAMS:
            vals = weekly_buckets[wk][field]
            entry[field] = (
                round(sum(1 for v in vals if safe_min <= v <= safe_max) / len(vals) * 100, 1)
                if vals else None
            )
        timeline.append(entry)

    return Response({
        'period': f'{days}d',
        'parameters': parameters,
        'timeline': timeline,
    })


# ── GET /api/readings/aggregate?period=90d ───────────────────────────────────

@api_view(['GET'])
def readings_aggregate(request):
    days = _parse_days(request.query_params.get('period'))
    rows = list(
        _readings_qs(days).values(
            'timestamp', 'temperature', 'turbidity', 'ph',
            'dissolved_oxygen', 'conductivity', 'nitrates',
        )
    )

    # Weekly averages
    weekly_vals = defaultdict(lambda: {f: [] for f, *_ in PARAMS})
    for r in rows:
        wk = _week_key(r['timestamp'])
        for field, *_ in PARAMS:
            if r[field] is not None:
                weekly_vals[wk][field].append(r[field])

    weekly = []
    for wk in sorted(weekly_vals):
        entry = {'week': wk}
        for field, *_ in PARAMS:
            vals = weekly_vals[wk][field]
            entry[field] = round(pystats.mean(vals), 3) if vals else None
        weekly.append(entry)

    # Overall per-parameter aggregates across the full period
    overall = {}
    for field, label, unit, safe_min, safe_max in PARAMS:
        vals = [r[field] for r in rows if r[field] is not None]
        overall[field] = {
            'label': label,
            'unit': unit,
            'mean': round(pystats.mean(vals), 3) if vals else None,
            'min': round(min(vals), 3) if vals else None,
            'max': round(max(vals), 3) if vals else None,
            'safeMin': safe_min,
            'safeMax': safe_max,
        }

    return Response({
        'period': f'{days}d',
        'totalReadings': len(rows),
        'weekly': weekly,
        'overall': overall,
    })
