# frontend_logs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.conf import settings
from core.utils.logger.backend_logger import setup_logger
from .swagger import frontend_log_schema

logger = setup_logger("frontend_logs")

class FrontendLogThrottle(AnonRateThrottle):
    scope = "frontend_logs"


class FrontendLogView(APIView):
    throttle_classes = [FrontendLogThrottle]

    @frontend_log_schema
    def post(self, request):
        if not getattr(settings, "FRONTEND_LOGS_ENABLED", False):
            return Response({"detail": "disabled"}, status=status.HTTP_204_NO_CONTENT)

        data = request.data or {}
        level = (data.get("level") or "error").lower()
        message = (data.get("message") or "")[:2000]
        url = data.get("url", "")[:500]
        app_version = data.get("appVersion")
        user_agent = data.get("userAgent", "")[:250]
        extra = data.get("extra", {})
        timestamp = data.get("ts", "")

        user = (
            request.user.username
            if request.user and request.user.is_authenticated
            else "anonymous"
        )

        # ✅ Add context-rich, structured log entry
        log_msg = (
            f"[FRONTEND_LOG] level={level} user={user} url={url} "
            f"appVersion={app_version} ts={timestamp} "
            f"userAgent={user_agent} message={message} extra={extra}"
        )

        if level == "debug":
            logger.debug(log_msg)
        elif level == "info":
            logger.info(log_msg)
        elif level == "warn":
            logger.warning(log_msg)
        else:
            logger.error(log_msg)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)