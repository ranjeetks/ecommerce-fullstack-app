# apps/orders/serializers.py

from rest_framework import serializers
from .models import Order, OrderItem
from apps.catalog.models import Product
from core.constants import DEFAULT_PRODUCT_IMAGE_URL


# ============================================================
# 🧾 ORDER ITEM SERIALIZER
# ============================================================
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "quantity",
            "price",
            "subtotal",
            "product_name",
            "product_image",
        ]

    def get_product_name(self, obj):
        # Optional safe lookup
        try:
            product = Product.objects.filter(id=obj.product_id).first()
            return product.name if product else "Unknown Product"
        except Exception:
            return "Unknown Product"

    def get_product_image(self, obj):
        request = self.context.get("request")
        product = Product.objects.filter(id=obj.product_id).first()

        if product and getattr(product, "image", None):
            try:
                return request.build_absolute_uri(product.image.url)
            except Exception:
                pass
        return request.build_absolute_uri(DEFAULT_PRODUCT_IMAGE_URL) if request else DEFAULT_PRODUCT_IMAGE_URL

    def get_subtotal(self, obj):
        return obj.quantity * obj.price


# ============================================================
# 🧾 ORDER SERIALIZER
# ============================================================
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount_display = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "total_amount",
            "total_amount_display",
            "payment_id",
            "status",
            "created_at",
            "updated_at",
            "item_count",
            "items",
        ]
        read_only_fields = ["user", "status", "created_at", "updated_at"]

    def get_total_amount_display(self, obj):
        return f"₹{obj.total_amount:.2f}"

    def get_item_count(self, obj):
        return obj.item_count