from .base import *  # noqa: F401, F403
import os  # noqa: E402

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

# Run Celery tasks synchronously in-process when Redis is not available.
# Set REDIS_URL in your .env to switch to a real broker for testing async behaviour.
if not os.environ.get("REDIS_URL"):
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE  # noqa: F405

INTERNAL_IPS = ["127.0.0.1"]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO"},
        "apps": {"handlers": ["console"], "level": "DEBUG"},
        "celery": {"handlers": ["console"], "level": "DEBUG"},
    },
}
