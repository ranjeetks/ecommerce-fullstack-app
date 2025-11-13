# apps/cart/views.py

from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from config.permissions import IsCustomer
from core.utils.logger.backend_logger import setup_logger
from core.mixins import RequestContextMixin

logger = setup_logger("api")

from .swagger import (
    cart_item_schema,
    cart_view_schema,
    add_to_cart_schema,
    remove_from_cart_schema,
    cart_list_schema,
)

# ============================================================
# 🧩 CART VIEW — Retrieve a single user’s cart (auto-creates if missing)
# ============================================================

@cart_view_schema
class CartView(RequestContextMixin, generics.RetrieveAPIView):
    """
    Retrieve the authenticated user's cart.
    If no cart exists, automatically create one.
    Automatically injects request context for nested serializers.
    """
    serializer_class = CartSerializer
    permission_classes = [IsCustomer]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def retrieve(self, request, *args, **kwargs):
        """Return serialized cart data with logging."""
        cart = self.get_object()
        logger.info(f"[CartView] User {request.user} accessed their cart (ID: {cart.id})")
        serializer = self.get_serializer(cart)  # ✅ context auto-added via mixin
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# 🧩 CART ITEM VIEWSET — Manage individual cart items (CRUD)
# ============================================================

@cart_item_schema
class CartItemViewSet(RequestContextMixin, viewsets.ModelViewSet):
    """
    Handles CRUD operations for items inside the user's cart.
    Scopes all actions to the current user's cart for security.
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        """Ensure user only accesses their own cart items."""
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    # context automatically added via RequestContextMixin


# ============================================================
# 🧩 ADD TO CART — Adds a product to the current user's cart
# ============================================================

@add_to_cart_schema
class AddToCartView(RequestContextMixin, generics.GenericAPIView):
    """
    Adds a product to the authenticated user's cart.
    Creates cart and item if not existing.
    """
    serializer_class = CartSerializer  # ✅ Required to avoid AssertionError
    permission_classes = [IsCustomer]

    def post(self, request, *args, **kwargs):
        product_id = self.kwargs.get("product_id")
        logger.info(f"[AddToCartView] User={request.user} adding product {product_id} to cart.")

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product_id=product_id)

        if not created:
            item.quantity += 1
            item.save()

        # ✅ Return updated cart snapshot
        serializer = self.get_serializer(cart, context=self.get_serializer_context())
        return Response(
            {
                "message": f"Product {product_id} added to cart",
                "cart": serializer.data
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# 🧩 REMOVE FROM CART — Removes a product from user's cart
# ============================================================

@remove_from_cart_schema
class RemoveFromCartView(RequestContextMixin, generics.GenericAPIView):
    """
    Removes a product from the user's cart.
    """
    permission_classes = [IsCustomer]

    def delete(self, request, pk):
        cart = get_object_or_404(Cart, user=request.user)
        deleted, _ = CartItem.objects.filter(cart=cart, product_id=pk).delete()
        logger.info(f"[RemoveFromCartView] User {request.user} removed product {pk} from cart {cart.id}")
        return Response({"message": f"Removed {deleted} item(s) from cart"}, status=status.HTTP_200_OK)


# ============================================================
# 🧩 CART LIST VIEW — Admin or debug listing of all carts
# ============================================================

@cart_list_schema
class CartListView(RequestContextMixin, generics.ListAPIView):
    """
    Returns all carts (for admin or internal debugging use only).
    """
    queryset = Cart.objects.select_related("user").all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]