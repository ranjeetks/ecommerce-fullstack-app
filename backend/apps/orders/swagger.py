# apps/orders/swagger.py

from drf_spectacular.utils import extend_schema, extend_schema_view
from core.swagger.tags import ORDER_TAG

# ✅ For ConfirmOrderView (APIView)
confirm_order_schema = extend_schema(
    tags=ORDER_TAG,
    summary="Confirm an order",
    description="Converts the current user's cart into an order. Requires authentication."
)

# ✅ NEW: For MyOrdersView (ListAPIView)
my_orders_schema = extend_schema_view(
    get=extend_schema(
        tags=ORDER_TAG,
        summary="List user's orders",
        description="Retrieve a list of all orders for the authenticated user. Supports filtering by status and date."
    )
)