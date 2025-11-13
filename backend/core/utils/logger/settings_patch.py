# core/utils/logger/settings_patch.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[4]
LOGGING_ENABLED = os.getenv("LOGGING_ENABLED", "true").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE = os.getenv("LOG_FILE", str(BASE_DIR / "logs" / "app.log"))

# ✅ Ensure the logs folder exists
LOG_PATH = Path(LOG_FILE)
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)


def apply_logging_settings():
    if not LOGGING_ENABLED:
        return {"version": 1, "disable_existing_loggers": True}

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "{levelname} {asctime} {name} {message}",
                "style": "{",
            }
        },
        "handlers": {
            "file": {
                "level": LOG_LEVEL,
                "class": "logging.handlers.RotatingFileHandler",
                "filename": LOG_FILE,
                "maxBytes": 5 * 1024 * 1024,
                "backupCount": 3,
                "formatter": "default",
            },
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            },
        },
        "root": {"handlers": ["file", "console"], "level": LOG_LEVEL},
    }