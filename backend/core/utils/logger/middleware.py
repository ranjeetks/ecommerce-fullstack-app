# core/utils/logger/middleware.py
from django.conf import settings
from .backend_logger import setup_logger

logger = setup_logger("api")

class APILogMiddleware:
    """Logs summary for API requests when logging enabled."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only log API paths to reduce noise; adjust prefix as needed
        try:
            path = request.path
        except Exception:
            path = ""

        if settings.LOGGING_ENABLED and path.startswith("/api/"):
            user = getattr(request, "user", None)
            username = getattr(user, "username", "Anonymous") if user else "Anonymous"
            logger.info(f"[API] {request.method} {path} status={response.status_code} user={username}")

        return response