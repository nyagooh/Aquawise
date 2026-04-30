import logging
import os

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')

try:
    import joblib
    _JOBLIB_OK = True
except ImportError:
    _JOBLIB_OK = False
    logger.warning('joblib not installed — ML model persistence disabled. Run: pip install joblib')


def _ensure_dir():
    os.makedirs(MODEL_DIR, exist_ok=True)


def save_model(name: str, model) -> bool:
    if not _JOBLIB_OK:
        return False
    _ensure_dir()
    path = os.path.join(MODEL_DIR, f'{name}.joblib')
    joblib.dump(model, path)
    return True


def load_model(name: str):
    if not _JOBLIB_OK:
        return None
    path = os.path.join(MODEL_DIR, f'{name}.joblib')
    if not os.path.exists(path):
        return None
    try:
        return joblib.load(path)
    except Exception as e:
        logger.warning(f'Failed to load model "{name}": {e}')
        return None


def model_exists(name: str) -> bool:
    path = os.path.join(MODEL_DIR, f'{name}.joblib')
    return os.path.exists(path)


def list_models() -> list:
    if not os.path.exists(MODEL_DIR):
        return []
    return [f[:-7] for f in os.listdir(MODEL_DIR) if f.endswith('.joblib')]
