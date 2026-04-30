from datetime import date, timedelta
import logging

import numpy as np

from .constants import PARAM_META, PARAMS
from .registry import load_model

logger = logging.getLogger(__name__)

# Fallback feature importances used when no RF model is trained yet.
_FALLBACK_IMPORTANCE = {
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


def _risk_label(value: float, safe_min: float, safe_max: float) -> str:
    if value < safe_min or value > safe_max:
        return 'danger'
    span = safe_max - safe_min
    if span and abs(value - (safe_min + safe_max) / 2) / (span / 2) > 0.8:
        return 'warning'
    return 'safe'


def forecast_parameter(param: str, recent_values: list, days: int = 14) -> dict:
    """
    Forecast `param` for `days` future steps.

    Uses the trained ExponentialSmoothing model if available; falls back to
    simple linear trend extrapolation. Always returns the same response shape.

    Returns:
        {
            'forecast': [{'date', 'value', 'lower', 'upper', 'risk'}, ...],
            'model_used': 'exponential_smoothing' | 'linear_trend',
        }
    """
    _, _, safe_min, safe_max = PARAM_META[param]
    today = date.today()
    model = load_model(f'ts_forecast_{param}')

    if model is not None and len(recent_values) >= 4:
        try:
            point_forecast = np.array(model.forecast(days), dtype=float)

            # Residual std from the training run (in-sample performance)
            resid_std = float(np.std(model.resid)) if hasattr(model, 'resid') else 0.3
            if resid_std == 0 or np.isnan(resid_std):
                resid_std = 0.3

            forecast = []
            for i, val in enumerate(point_forecast):
                # 95% CI: widen with forecast horizon (horizon uncertainty)
                ci = 1.96 * resid_std * (1 + i * 0.05)
                val_f = float(val)
                forecast.append({
                    'date': (today + timedelta(days=i + 1)).isoformat(),
                    'value': round(val_f, 3),
                    'lower': round(max(0.0, val_f - ci), 3),
                    'upper': round(val_f + ci, 3),
                    'risk': _risk_label(val_f, safe_min, safe_max),
                })
            return {'forecast': forecast, 'model_used': 'exponential_smoothing'}

        except Exception as e:
            logger.warning(f'ES forecast failed for "{param}": {e}')

    # Linear trend fallback
    return {
        'forecast': _linear_forecast(recent_values, days, safe_min, safe_max),
        'model_used': 'linear_trend',
    }


def _linear_forecast(values: list, days: int, safe_min: float, safe_max: float) -> list:
    today = date.today()
    if values:
        baseline = sum(values) / len(values)
        trend = (values[-1] - values[0]) / len(values) if len(values) >= 2 else 0.0
    else:
        baseline = (safe_min + safe_max) / 2
        trend = 0.0

    result = []
    for i in range(1, days + 1):
        proj = baseline + trend * i
        ci = 0.25 + i * 0.07
        result.append({
            'date': (today + timedelta(days=i)).isoformat(),
            'value': round(proj, 3),
            'lower': round(max(0.0, proj - ci), 3),
            'upper': round(proj + ci, 3),
            'risk': _risk_label(proj, safe_min, safe_max),
        })
    return result


def get_feature_importance(param: str) -> tuple:
    """
    Return (importances_list, from_trained_model).

    importances_list: [{'feature': str, 'importance': float}, ...]  sorted desc
    from_trained_model: True if a real RF model was used, False if fallback
    """
    model = load_model(f'rf_{param}')
    feature_params = [p for p in PARAMS if p != param]

    if model is not None:
        importances = model.feature_importances_
        result = [
            {'feature': feat, 'importance': round(float(imp), 4)}
            for feat, imp in zip(feature_params, importances)
        ]
        result.sort(key=lambda x: x['importance'], reverse=True)
        return result, True

    fallback = _FALLBACK_IMPORTANCE.get(param, _FALLBACK_IMPORTANCE['nitrates'])
    return fallback, False


def detect_anomalies(readings: list) -> list:
    """
    Annotate each reading dict with 'isAnomaly' (bool) and 'anomalyScore' (float).
    Higher anomalyScore = more anomalous.
    """
    model = load_model('anomaly_detector')

    if model is None or not readings:
        for r in readings:
            r['isAnomaly'] = False
            r['anomalyScore'] = 0.0
        return readings

    X = np.array(
        [[float(r.get(p) or 0) for p in PARAMS] for r in readings],
        dtype=float,
    )

    try:
        # decision_function: more negative = more anomalous; invert for intuitive score
        scores = model.decision_function(X)
        predictions = model.predict(X)  # -1 = anomaly, 1 = normal
        for i, r in enumerate(readings):
            r['isAnomaly'] = bool(predictions[i] == -1)
            r['anomalyScore'] = round(float(-scores[i]), 4)
    except Exception as e:
        logger.warning(f'Anomaly detection failed: {e}')
        for r in readings:
            r['isAnomaly'] = False
            r['anomalyScore'] = 0.0

    return readings
