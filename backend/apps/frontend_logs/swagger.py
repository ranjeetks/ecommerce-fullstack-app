# apps/frontend_logs/swagger.py

from drf_spectacular.utils import extend_schema
from core.swagger.tags import LOG_TAG

frontend_log_schema = extend_schema(
    tags=LOG_TAG,
    summary="Receive frontend logs",
    description=(
        "Accepts log data sent from the frontend (errors, warnings, info, performance, etc.). "
        "Logs can then be stored, analyzed, or forwarded for debugging."
    )
)