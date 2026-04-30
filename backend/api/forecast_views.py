from datetime import date, timedelta

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .ml.constants import PARAM_META, PARAMS
from .ml.predictor import detect_anomalies, forecast_parameter, get_feature_importance
from .ml.registry import model_exists
from .models import Alert, RegionPrediction, StationReading, TimeSeriesReading, WaterSource


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


def _risk_label(value, safe_min, safe_max):
    if value < safe_min or value > safe_max:
        return 'danger'
    span = safe_max - safe_min
    if span and abs(value - (safe_min + safe_max) / 2) / (span / 2) > 0.8:
        return 'warning'
    return 'safe'


def _station_series(source, param, limit=60):
    """Return chronological float list for one param at one station."""
    vals = list(
        StationReading.objects
        .filter(station=source, **{f'{param}__isnull': False})
        .order_by('timestamp')
        .values_list(param, flat=True)[:limit]
    )
    return [float(v) for v in vals]


def _global_series(param):
    """Return chronological float list from the global TimeSeriesReading table."""
    return [
        float(v) for v in
        TimeSeriesReading.objects
        .order_by('timestamp')
        .values_list(param, flat=True)
    ]


# ── GET /api/forecasts/nitrate/?utility={id}&days=14&param=nitrates ───────────

@api_view(['GET'])
def forecast_nitrate(request):
    utility_id = request.query_params.get('utility')
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)
    param = request.query_params.get('param', 'nitrates')

    if param not in PARAM_META:
        param = 'nitrates'

    _, unit, safe_min, safe_max = PARAM_META[param]

    source = None
    recent_values = []

    if utility_id:
        source = get_object_or_404(
            WaterSource.objects.select_related('region'), source_id=utility_id
        )
        recent_values = _station_series(source, param)

    if not recent_values:
        recent_values = _global_series(param)

    result = forecast_parameter(param, recent_values, days)

    baseline = (
        sum(recent_values[-14:]) / len(recent_values[-14:])
        if recent_values else (safe_min + safe_max) / 2
    )

    return Response({
        'utilityId': source.source_id if source else None,
        'utilityName': source.name if source else 'All stations',
        'days': days,
        'parameter': param,
        'unit': unit,
        'safeMax': safe_max,
        'safeMin': safe_min,
        'baseline': round(baseline, 3),
        'forecast': result['forecast'],
        'modelUsed': result['model_used'],
    })


# ── GET /api/forecasts/heatmap/?days=14 ──────────────────────────────────────

@api_view(['GET'])
def forecast_heatmap(request):
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)

    sources = list(
        WaterSource.objects
        .select_related('region')
        .prefetch_related('readings')
    )
    region_preds = {
        p.region_id: p
        for p in RegionPrediction.objects.select_related('region')
    }

    today = date.today()
    utilities = []

    for source in sources:
        latest = source.readings.first()
        current_scores = {}
        param_forecast_scores = {p: [] for p in PARAMS}

        for param in PARAMS:
            _, _, safe_min, safe_max = PARAM_META[param]
            span = safe_max - safe_min or 1

            # Current risk score from latest reading
            current_val = getattr(latest, param, None) if latest else None
            if current_val is not None:
                current_scores[param] = round(
                    _clamp((float(current_val) - safe_min) / span, 0.0, 1.0), 3
                )
            else:
                pred = region_preds.get(source.region_id)
                current_scores[param] = round(
                    _clamp((pred.risk_score / 100) if pred else 0.4, 0.0, 1.0), 3
                )

            # ML per-day forecast risk scores
            values = _station_series(source, param)
            if not values and current_val is not None:
                values = [float(current_val)]

            result = forecast_parameter(param, values, days)
            for pt in result['forecast']:
                score = _clamp((pt['value'] - safe_min) / span, 0.0, 1.0)
                param_forecast_scores[param].append(round(score, 3))

        forecast = [
            {
                'date': (today + timedelta(days=i + 1)).isoformat(),
                'scores': {p: param_forecast_scores[p][i] for p in PARAMS},
            }
            for i in range(days)
        ]

        utilities.append({
            'id': source.source_id,
            'name': source.name,
            'regionId': source.region.region_id,
            'currentScores': current_scores,
            'forecast': forecast,
        })

    return Response({
        'days': days,
        'parameters': PARAMS,
        'utilities': utilities,
    })


# ── GET /api/ml/feature-importance/?param=nitrates ────────────────────────────

@api_view(['GET'])
def feature_importance(request):
    model_type = request.query_params.get('model', 'random_forest')
    param = request.query_params.get('param', 'nitrates')
    if param not in PARAM_META:
        param = 'nitrates'

    features, from_trained = get_feature_importance(param)

    return Response({
        'model': model_type,
        'parameter': param,
        'features': features,
        'fromTrainedModel': from_trained,
        'trainingNote': (
            'Feature importances from RandomForestRegressor trained on historical sensor readings.'
            if from_trained
            else 'Using default importances — run `python manage.py train_models` to use real ML.'
        ),
    })


# ── GET /api/ml/models/ ───────────────────────────────────────────────────────

@api_view(['GET'])
def ml_model_status(request):
    """Return which ML models are trained and on disk."""
    expected = (
        [f'ts_forecast_{p}' for p in PARAMS]
        + [f'rf_{p}' for p in PARAMS]
        + ['anomaly_detector']
    )
    status = {name: model_exists(name) for name in expected}
    trained_count = sum(status.values())

    return Response({
        'models': status,
        'trainedCount': trained_count,
        'totalModels': len(expected),
        'allTrained': trained_count == len(expected),
        'trainCommand': 'python manage.py train_models',
    })


# ── GET /api/ml/anomalies/?limit=100 ─────────────────────────────────────────

@api_view(['GET'])
def anomaly_detection(request):
    """Return recent readings annotated with anomaly scores."""
    limit = _clamp(int(request.query_params.get('limit', 100)), 10, 500)

    readings = list(
        TimeSeriesReading.objects
        .order_by('-timestamp')
        .values('timestamp', *PARAMS)[:limit]
    )
    for r in readings:
        r['timestamp'] = r['timestamp'].isoformat()

    annotated = detect_anomalies(readings)
    anomaly_count = sum(1 for r in annotated if r.get('isAnomaly'))

    return Response({
        'count': len(annotated),
        'anomalyCount': anomaly_count,
        'readings': annotated,
    })


# ── GET /api/insights/?days=14 ────────────────────────────────────────────────

@api_view(['GET'])
def insights(request):
    days = _clamp(int(request.query_params.get('days', 14)), 1, 60)
    generated = []

    # 1. Active alerts grouped by parameter
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
            'description': f'{len(alerts)} active {param} alert(s) detected. Affected: {loc_str}.',
            'affectedLocations': [a.source for a in alerts],
            'parameter': param,
            'recommendedAction': (
                'Issue boil-water advisory and isolate affected sources.'
                if severity == 'danger'
                else 'Increase monitoring frequency and review treatment protocols.'
            ),
        })

    # 2. ML-based: parameters forecast to breach safe limits
    ts_values = {p: _global_series(p) for p in PARAMS}
    for p in PARAMS:
        _, unit, safe_min, safe_max = PARAM_META[p]
        label = PARAM_META[p][0]
        vals = ts_values[p]
        if not vals:
            continue

        result = forecast_parameter(p, vals, days)
        danger_pts = [pt for pt in result['forecast'] if pt['risk'] == 'danger']
        warn_pts = [pt for pt in result['forecast'] if pt['risk'] == 'warning']

        if danger_pts:
            generated.append({
                'id': f'ins_ml_danger_{p}',
                'severity': 'danger',
                'title': f'ML forecast: {label} critical in {len(danger_pts)} day(s)',
                'description': (
                    f'Model forecasts {label} exceeding safe limits on '
                    f'{danger_pts[0]["date"]} ({danger_pts[0]["value"]} {unit}).'
                ),
                'affectedLocations': [],
                'parameter': p,
                'recommendedAction': 'Pre-emptive treatment and source inspection recommended.',
                'mlBased': True,
                'forecastModel': result['model_used'],
            })
        elif len(warn_pts) >= 3:
            generated.append({
                'id': f'ins_ml_warning_{p}',
                'severity': 'warning',
                'title': f'ML forecast: {label} trending toward threshold',
                'description': (
                    f'Model forecasts {label} entering warning range on {warn_pts[0]["date"]}.'
                ),
                'affectedLocations': [],
                'parameter': p,
                'recommendedAction': 'Increase monitoring frequency.',
                'mlBased': True,
                'forecastModel': result['model_used'],
            })

    # 3. Regions with ML-updated rising risk
    for pred in (
        RegionPrediction.objects
        .filter(next_risk='rising')
        .select_related('region')
        .prefetch_related('region__water_sources')
    ):
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

    if not generated:
        generated.append({
            'id': 'ins_all_clear',
            'severity': 'safe',
            'title': 'All parameters within safe limits',
            'description': f'No active alerts or forecast risks detected over the next {days} days.',
            'affectedLocations': [],
            'parameter': None,
            'recommendedAction': 'Continue routine monitoring.',
        })

    return Response({'days': days, 'count': len(generated), 'insights': generated})
