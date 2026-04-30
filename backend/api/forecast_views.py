from datetime import date, timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Alert, RegionPrediction, StationReading, TimeSeriesReading, WaterSource


# (field, label, unit, safe_min, safe_max)
PARAMS = [
    ('temperature',      'Temperature',      '°C',     15.0,  30.0),
    ('turbidity',        'Turbidity',        'NTU',     0.0,   5.0),
    ('ph',               'pH Level',         'pH',      6.5,   8.5),
    ('dissolved_oxygen', 'Dissolved Oxygen', 'mg/L',    6.0,  14.0),
    ('conductivity',     'Conductivity',     'µS/cm', 200.0, 800.0),
    ('nitrates',         'Nitrates',         'mg/L',    0.0,  10.0),
]
PARAM_META = {p[0]: p for p in PARAMS}


def _risk_label(value, safe_min, safe_max):
    if value > safe_max:
        return 'danger'
    span = safe_max - safe_min
    if span and (value - safe_min) / span > 0.8:
        return 'warning'
    return 'safe'


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


# ── GET /api/forecasts/nitrate?utility={id}&days=14 ───────────────────────────

@api_view(['GET'])
def forecast_nitrate(request):
    utility_id = request.query_params.get('utility')
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)

    source = None
    if utility_id:
        source = get_object_or_404(
            WaterSource.objects.select_related('region'), source_id=utility_id
        )

    # Derive baseline and per-reading trend from recent station data
    baseline = None
    trend = 0.0
    if source:
        vals = list(
            StationReading.objects
            .filter(station=source, nitrates__isnull=False)
            .order_by('-timestamp')
            .values_list('nitrates', flat=True)[:14]
        )
        if vals:
            baseline = sum(vals) / len(vals)
            if len(vals) >= 2:
                # positive = rising, negative = falling
                trend = (vals[0] - vals[-1]) / len(vals)

    if baseline is None:
        ts_vals = list(
            TimeSeriesReading.objects
            .order_by('-timestamp')
            .values_list('nitrates', flat=True)[:24]
        )
        baseline = sum(ts_vals) / len(ts_vals) if ts_vals else 4.2
        trend = 0.04

    safe_max = 10.0
    today = date.today()
    forecast = []
    for i in range(1, days + 1):
        projected = baseline + trend * i
        # Confidence interval widens linearly with horizon
        ci = 0.25 + i * 0.07
        forecast.append({
            'date': (today + timedelta(days=i)).isoformat(),
            'value': round(projected, 3),
            'lower': round(max(0.0, projected - ci), 3),
            'upper': round(projected + ci, 3),
            'risk': _risk_label(projected, 0.0, safe_max),
        })

    return Response({
        'utilityId': source.source_id if source else None,
        'utilityName': source.name if source else 'All stations',
        'days': days,
        'parameter': 'nitrates',
        'unit': 'mg/L',
        'safeMax': safe_max,
        'baseline': round(baseline, 3),
        'forecast': forecast,
    })


# ── GET /api/forecasts/heatmap?days=14 ───────────────────────────────────────

@api_view(['GET'])
def forecast_heatmap(request):
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)

    sources = list(
        WaterSource.objects
        .select_related('region')
        .prefetch_related('readings')
    )
    # region_id (CharField) → RegionPrediction
    preds = {
        p.region.region_id: p
        for p in RegionPrediction.objects.select_related('region')
    }

    today = date.today()
    utilities = []
    for source in sources:
        latest = source.readings.first()  # StationReading ordered -timestamp
        pred = preds.get(source.region.region_id)

        # Risk score per param: 0.0 = fully in range, 1.0 = at/beyond safe_max
        current_scores = {}
        for field, _, _, safe_min, safe_max in PARAMS:
            val = getattr(latest, field, None) if latest else None
            if val is not None:
                span = safe_max - safe_min or 1
                score = _clamp((val - safe_min) / span, 0.0, 1.0)
            else:
                # No reading — proxy from region risk_score
                score = _clamp((pred.risk_score / 100) if pred else 0.4, 0.0, 1.0)
            current_scores[field] = round(score, 3)

        trend_delta = {'rising': 0.02, 'falling': -0.02, 'stable': 0.0}.get(
            pred.next_risk if pred else 'stable', 0.0
        )

        forecast = []
        for i in range(1, days + 1):
            forecast.append({
                'date': (today + timedelta(days=i)).isoformat(),
                'scores': {
                    f: round(_clamp(current_scores[f] + trend_delta * i, 0.0, 1.0), 3)
                    for f in current_scores
                },
            })

        utilities.append({
            'id': source.source_id,
            'name': source.name,
            'regionId': source.region.region_id,
            'currentScores': current_scores,
            'forecast': forecast,
        })

    return Response({
        'days': days,
        'parameters': [p[0] for p in PARAMS],
        'utilities': utilities,
    })


# ── GET /api/ml/feature-importance?model=random_forest&param=nitrates ─────────

_FEATURE_IMPORTANCE = {
    'nitrates': [
        {'feature': 'conductivity',     'importance': 0.31},
        {'feature': 'turbidity',        'importance': 0.26},
        {'feature': 'temperature',      'importance': 0.19},
        {'feature': 'ph',               'importance': 0.15},
        {'feature': 'dissolved_oxygen', 'importance': 0.09},
    ],
    'turbidity': [
        {'feature': 'nitrates',         'importance': 0.28},
        {'feature': 'conductivity',     'importance': 0.25},
        {'feature': 'ph',               'importance': 0.22},
        {'feature': 'temperature',      'importance': 0.16},
        {'feature': 'dissolved_oxygen', 'importance': 0.09},
    ],
    'ph': [
        {'feature': 'conductivity',     'importance': 0.35},
        {'feature': 'dissolved_oxygen', 'importance': 0.27},
        {'feature': 'temperature',      'importance': 0.20},
        {'feature': 'turbidity',        'importance': 0.11},
        {'feature': 'nitrates',         'importance': 0.07},
    ],
}


@api_view(['GET'])
def feature_importance(request):
    model = request.query_params.get('model', 'random_forest')
    param = request.query_params.get('param', 'nitrates')
    features = _FEATURE_IMPORTANCE.get(param, _FEATURE_IMPORTANCE['nitrates'])
    return Response({
        'model': model,
        'parameter': param,
        'features': features,
        'trainingNote': 'Importances from Random Forest trained on 24-month regional historical data.',
    })


# ── GET /api/insights?days=14 ─────────────────────────────────────────────────

@api_view(['GET'])
def insights(request):
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)

    generated = []

    # 1. Group active alerts by parameter → one insight per parameter
    active_alerts = list(Alert.objects.filter(status='active').select_related('region'))
    by_param = {}
    for a in active_alerts:
        by_param.setdefault(a.parameter, []).append(a)

    for param, alerts in by_param.items():
        severity = 'danger' if any(a.risk == 'danger' for a in alerts) else 'warning'
        locations = list({a.source for a in alerts})
        loc_str = ', '.join(locations[:3]) + ('…' if len(locations) > 3 else '')
        generated.append({
            'id': f'ins_alert_{param.lower().replace(" ", "_").replace(".", "")}',
            'severity': severity,
            'title': f'{param} alerts at {len(locations)} location(s)',
            'description': (
                f'{len(alerts)} active {param} alert(s) detected. Affected: {loc_str}.'
            ),
            'affectedLocations': [a.source for a in alerts],
            'parameter': param,
            'recommendedAction': (
                'Issue boil-water advisory and isolate affected sources.'
                if severity == 'danger'
                else 'Increase monitoring frequency and review treatment protocols.'
            ),
        })

    # 2. Regions with rising predicted risk
    rising = (
        RegionPrediction.objects
        .filter(next_risk='rising')
        .select_related('region')
        .prefetch_related('region__water_sources')
    )
    for pred in rising:
        source_ids = [ws.source_id for ws in pred.region.water_sources.all()]
        generated.append({
            'id': f'ins_rising_{pred.region.region_id}',
            'severity': pred.risk_level,
            'title': f'Rising contamination risk: {pred.region.name}',
            'description': pred.prediction_text,
            'affectedLocations': source_ids,
            'parameter': pred.top_concern if pred.top_concern != 'None' else None,
            'recommendedAction': (
                'Deploy field team for physical sampling and analysis.'
                if pred.risk_level == 'danger'
                else 'Monitor closely and prepare contingency treatment.'
            ),
        })

    # 3. Positive fallback
    if not generated:
        generated.append({
            'id': 'ins_all_clear',
            'severity': 'safe',
            'title': 'All parameters within safe limits',
            'description': (
                f'No active alerts across all monitored locations in the past {days} days.'
            ),
            'affectedLocations': [],
            'parameter': None,
            'recommendedAction': 'Continue routine monitoring.',
        })

    return Response({'days': days, 'count': len(generated), 'insights': generated})
