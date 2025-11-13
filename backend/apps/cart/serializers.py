# apps/cart/serializers.py

from rest_framework import serializers
from .models import Cart, CartItem
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from core.constants import DEFAULT_PRODUCT_IMAGE_URL


# ============================================================
# 🧩 CART ITEM SERIALIZER
# ============================================================

class CartItemSerializer(serializers.ModelSerializer):
    """
    Represents a single item inside the user's cart.
    Includes product details (name, price, image) from ProductSerializer.
    """
    product = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "quantity",
            "product",
            "subtotal",
        ]

    # -------------------------
    # 🔹 Product Details (nested)
    # -------------------------
    def get_product(self, obj):
        """Return serialized product details with safe fallback."""
        product = Product.objects.filter(id=obj.product_id).first()
        if not product:
            return {
                "id": obj.product_id,
                "name": "Unknown Product",
                "image": DEFAULT_PRODUCT_IMAGE_URL,
                "price": 0,
            }

        # ✅ Use same context to ensure request is passed to nested serializer
        return ProductSerializer(product, context=self.context).data

    # -------------------------
    # 🔹 Subtotal (quantity × price)
    # -------------------------
    def get_subtotal(self, obj):
        """Return subtotal for this cart item (formatted)."""
        product = Product.objects.filter(id=obj.product_id).first()
        if not product:
            return "₹0.00"
        total = product.price * obj.quantity
        return f"₹{total:.2f}"


# ============================================================
# 🧩 CART SERIALIZER
# ============================================================

class CartSerializer(serializers.ModelSerializer):
    """
    Represents the user's full cart with all items.
    Calculates total amount dynamically.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_amount",
        ]

    # -------------------------
    # 🔹 Total Amount (sum of all subtotals)
    # -------------------------
    def get_total_amount(self, obj):
        """Compute and format total amount for all cart items."""
        request = self.context.get("request")
        total = 0
        for item in obj.items.all():
            product = Product.objects.filter(id=item.product_id).first()
            if product:
                total += product.price * item.quantity
        return f"₹{total:.2f}"