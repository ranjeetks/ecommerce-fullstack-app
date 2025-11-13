# apps/catalog/serializers.py

from rest_framework import serializers
from .models import Product
from core.constants import DEFAULT_PRODUCT_IMAGE_URL
import logging
from django.conf import settings

logger = logging.getLogger("api")


# ============================================================
# 🧩 PRODUCT SERIALIZER
# ============================================================

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for product details, used across the API (catalog, cart, wishlist, orders).
    - Automatically builds full image URLs.
    - Validates price and stock.
    - Provides consistent, safe defaults for missing images.
    """
    image = serializers.ImageField(required=False, allow_null=True)  # ✅ accepts file
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"  # Includes id, name, price, description, image, stock, etc.
        read_only_fields = ["created_at", "updated_at"]

    # -------------------------
    # 🔹 Field Validations
    # -------------------------
    def validate_price(self, value):
        """Ensure product price is greater than zero."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_stock(self, value):
        """Ensure stock count is positive."""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def validate_image(self, value):
        """Warn if no image provided (non-blocking)."""
        if not value:
            logger.warning("[ProductSerializer] Product image missing during validation.")
        return value

    # -------------------------
    # 🔹 Image URL Builder
    # -------------------------
    def get_image_url(self, obj):
        """
        Returns a full image URL for the product.
        - Cloudinary: returns its full HTTPS URL directly.
        - Local/Dev: builds absolute URI for MEDIA_URL.
        - Falls back to DEFAULT_PRODUCT_IMAGE_URL if missing.
        """
        request = self.context.get("request")

        try:
            if obj.image and hasattr(obj.image, "url"):
                image_url = obj.image.url

                # ✅ Cloudinary URL (already full, don't rebuild)
                if image_url.startswith("http"):
                    return image_url

                # ✅ Local file (append domain)
                if request:
                    return request.build_absolute_uri(image_url)
                return image_url
        except Exception as e:
            logger.warning(f"[ProductSerializer] Image access failed for Product ID={obj.id}: {e}")

        # 🟡 Fallback
        return getattr(settings, "DEFAULT_PRODUCT_IMAGE_URL", "/media/products/default.jpg")



    # -------------------------
    # 🔹 Helper: Build absolute URLs safely
    # -------------------------
    def _build_absolute_url(self, request, path):
        """Safely build absolute image URL with fallback."""
        if request:
            return request.build_absolute_uri(path)
        return path