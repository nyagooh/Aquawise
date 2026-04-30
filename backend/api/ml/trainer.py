import logging

import numpy as np

logger = logging.getLogger(__name__)

try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing, SimpleExpSmoothing
    _STATSMODELS_OK = True
except ImportError:
    _STATSMODELS_OK = False
    logger.warning('statsmodels not installed — time-series forecasting disabled.')

try:
    from sklearn.ensemble import IsolationForest, RandomForestRegressor
    _SKLEARN_OK = True
except ImportError:
    _SKLEARN_OK = False
    logger.warning('scikit-learn not installed — RF and anomaly detection disabled.')


def train_ts_forecast(values: list):
    """
    Fit a Holt (double exponential smoothing) model on `values`.

    Selection rules:
      < 4 points  → None (too little data)
      4–9 points  → SimpleExpSmoothing (level only, no trend)
      10+ points  → ExponentialSmoothing with additive trend + damping

    Returns a fitted statsmodels results object or None.
    """
    if not _STATSMODELS_OK:
        return None

    arr = np.array(values, dtype=float)
    n = len(arr)

    if n < 4:
        return None

    try:
        if n < 10:
            return SimpleExpSmoothing(arr).fit(optimized=True)

        return ExponentialSmoothing(
            arr,
            trend='add',
            damped_trend=True,
        ).fit(optimized=True)

    except Exception as e:
        logger.warning(f'ExponentialSmoothing fit failed ({n} samples): {e}')
        # Last-resort fallback: fixed smoothing level
        try:
            return SimpleExpSmoothing(arr).fit(smoothing_level=0.3, optimized=False)
        except Exception:
            return None


def train_random_forest(X: np.ndarray, y: np.ndarray):
    """
    Fit a RandomForestRegressor with X as input features and y as target.
    Requires at least 10 samples. Returns fitted model or None.
    """
    if not _SKLEARN_OK:
        return None
    if len(X) < 10:
        return None

    n_estimators = min(200, max(20, len(X) * 5))
    rf = RandomForestRegressor(
        n_estimators=n_estimators,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X, y)
    return rf


def train_anomaly_detector(X: np.ndarray):
    """
    Fit an IsolationForest on the full feature matrix X.
    Requires at least 10 samples. Returns fitted model or None.
    """
    if not _SKLEARN_OK:
        return None
    if len(X) < 10:
        return None

    contamination = min(0.1, max(0.01, 3.0 / len(X)))
    iso = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=42,
        n_jobs=-1,
    )
    iso.fit(X)
    return iso
