# apps/cart/swagger.py

from drf_spectacular.utils import extend_schema, extend_schema_view
from core.swagger.tags import CART_TAG

# 1) For ModelViewSet (CartItemViewSet)
cart_item_schema = extend_schema_view(
    list=extend_schema(
        tags=CART_TAG,
        summary="List cart items",
        description="Retrieve all cart items (for debugging or admin use)."
    ),
    retrieve=extend_schema(
        tags=CART_TAG,
        summary="Retrieve a cart item",
        description="Get details of a specific cart item by ID."
    ),
    create=extend_schema(
        tags=CART_TAG,
        summary="Add item to cart",
        description="Create a new cart item or increase quantity."
    ),
    update=extend_schema(
        tags=CART_TAG,
        summary="Update cart item",
        description="Update a cart item (e.g., change quantity)."
    ),
    partial_update=extend_schema(
        tags=CART_TAG,
        summary="Partially update a cart item",
        description="Update specific fields of a cart item."
    ),
    destroy=extend_schema(
        tags=CART_TAG,
        summary="Remove cart item",
        description="Delete a cart item."
    ),
)

# 2) For RetrieveAPIView (CartView)
cart_view_schema = extend_schema_view(
    get=extend_schema(
        tags=CART_TAG,
        summary="Get user's cart",
        description="Retrieve the current user's cart with all items."
    )
)

# 3) For AddToCartView (GenericAPIView with POST)
add_to_cart_schema = extend_schema(
    tags=CART_TAG,
    summary="Add product to cart",
    description="Add a product to the cart. If it already exists, increase quantity."
)

# 4) For RemoveFromCartView (GenericAPIView with DELETE)
remove_from_cart_schema = extend_schema(
    tags=CART_TAG,
    summary="Remove product from cart",
    description="Remove a specific product from the cart."
)

# 5) For CartListView (ListCreateAPIView)
cart_list_schema = extend_schema_view(
    list=extend_schema(
        tags=CART_TAG,
        summary="List all carts",
        description="(Admin) List all user carts."
    ),
    create=extend_schema(
        tags=CART_TAG,
        summary="Create a cart",
        description="Create a new cart (usually not used manually)."
    ),
)