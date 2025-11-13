# core/utils/logger/backend_logger.py

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional
from django.conf import settings  # ✅ import settings to detect DEBUG

# Resolve project base directory (adjust parents index if your project layout differs)
BASE_DIR = Path(__file__).resolve().parents[3]

# Read configuration from environment
LOGGING_ENABLED: bool = os.getenv("LOGGING_ENABLED", "true").lower() == "true"
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE: Path = Path(os.getenv("LOG_FILE", str(BASE_DIR / "logs" / "app.log")))

# Ensure log directory exists
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)


def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Return a configured logger instance.

    Usage:
        from core.utils.logger.backend_logger import setup_logger
        logger = setup_logger(__name__)
        logger.info("message")
    """
    logger_name = name or "app"
    logger = logging.getLogger(logger_name)

    # Avoid configuring the same logger multiple times
    if getattr(logger, "_is_configured", False):
        return logger

    # If logging is disabled, mark logger disabled and return
    if not LOGGING_ENABLED:
        logger.disabled = True
        logger._is_configured = True
        return logger

    # Configure logger level
    level = getattr(logging, LOG_LEVEL, logging.INFO)
    logger.setLevel(level)

    # Formatter (use structured-ish format; you can change to JSON later)
    formatter = logging.Formatter(
        "{levelname} {asctime} {name} {message}", style="{"
    )

    # ✅ IMPORTANT:
    # In development (DEBUG=True), use simple FileHandler (no rotation).
    # On Windows, RotatingFileHandler can fail if the file is being read (permission issue).
    # In production (DEBUG=False), use RotatingFileHandler for safe rotation.
    if settings.DEBUG:
        # Development mode → no rotation to avoid WinError 32
        file_handler = logging.FileHandler(str(LOG_FILE))
    else:
        # Production mode → safe to use RotatingFileHandler (Render/Linux)
        file_handler = RotatingFileHandler(
            str(LOG_FILE),
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=3
        )

    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)

    # Console handler (useful in Docker/Render logs)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)

    # Attach handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Prevent double logging to root handlers
    logger.propagate = False

    # Mark configured to avoid duplicate handlers on subsequent calls
    logger._is_configured = True

    return logger