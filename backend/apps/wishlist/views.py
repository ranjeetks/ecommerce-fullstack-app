# apps/wishlist/views.py

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from apps.catalog.models import Product
from config.permissions import IsCustomer
from core.mixins import RequestContextMixin
from core.utils.logger.backend_logger import setup_logger
from .swagger import (
    wishlist_schema,
    add_to_wishlist_schema,
    remove_from_wishlist_schema,
)

logger = setup_logger("api")


# ============================================================
# 🧩 WISHLIST VIEW — Retrieve the current user's wishlist
# ============================================================

@wishlist_schema
class WishlistView(RequestContextMixin, generics.RetrieveAPIView):
    """
    Retrieve the authenticated user's wishlist.
    Automatically creates one if it doesn't exist.
    Injects `request` context for nested serializers (e.g., product images).
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsCustomer]

    def get_object(self):
        wishlist, _ = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    def retrieve(self, request, *args, **kwargs):
        """Return serialized wishlist data with structured logging."""
        wishlist = self.get_object()
        logger.info(f"[WishlistView] User {request.user} accessed wishlist (ID: {wishlist.id})")
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# 🧩 ADD TO WISHLIST — Adds a product to user's wishlist
# ============================================================

@add_to_wishlist_schema
class AddToWishlistView(RequestContextMixin, generics.GenericAPIView):
    """
    Adds a product to the user's wishlist.
    Ensures product exists, prevents duplicates, and returns updated wishlist.
    """
    serializer_class = WishlistSerializer  # ✅ Required to avoid AssertionError
    permission_classes = [IsCustomer]

    def post(self, request, product_id):
        logger.info(f"[AddToWishlistView] User={request.user} adding product {product_id} to wishlist.")

        # ✅ Validate product exists
        if not Product.objects.filter(id=product_id).exists():
            return Response({"error": "Invalid product ID"}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist, product_id=product_id
        )

        # ✅ Return current wishlist snapshot
        serializer = self.get_serializer(wishlist, context=self.get_serializer_context())

        if created:
            message = "Product added to wishlist"
        else:
            message = "Product already in wishlist"

        return Response(
            {"message": message, "wishlist": serializer.data},
            status=status.HTTP_200_OK
        )
# ============================================================
# 🧩 REMOVE FROM WISHLIST — Remove a product from user's wishlist
# ============================================================

@remove_from_wishlist_schema
class RemoveFromWishlistView(RequestContextMixin, generics.GenericAPIView):
    """
    Remove a product from the authenticated user's wishlist.
    """
    permission_classes = [IsCustomer]

    def delete(self, request, pk):
        wishlist = get_object_or_404(Wishlist, user=request.user)
        deleted, _ = WishlistItem.objects.filter(wishlist=wishlist, product_id=pk).delete()

        logger.info(
            f"[RemoveFromWishlistView] User {request.user} removed product {pk} from wishlist {wishlist.id}"
        )
        return Response(
            {"message": f"Removed {deleted} item(s) from wishlist"},
            status=status.HTTP_200_OK,
        )