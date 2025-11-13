# apps/wishlist/swagger.py

from drf_spectacular.utils import extend_schema, extend_schema_view
from core.swagger.tags import WISHLIST_TAG

# 1) For GET WishlistView (RetrieveAPIView)
wishlist_schema = extend_schema_view(
    get=extend_schema(
        tags=WISHLIST_TAG,
        summary="Get user's wishlist",
        description="Retrieve the wishlist for the authenticated user."
    )
)

# 2) For POST AddToWishlistView
add_to_wishlist_schema = extend_schema(
    tags=WISHLIST_TAG,
    summary="Add product to wishlist",
    description="Add a product to the user's wishlist. If it already exists, return a message."
)

# 3) For DELETE RemoveFromWishlistView
remove_from_wishlist_schema = extend_schema(
    tags=WISHLIST_TAG,
    summary="Remove product from wishlist",
    description="Remove a product from the user's wishlist."
)