# apps/wishlist/serializers.py
from rest_framework import serializers
from .models import Wishlist, WishlistItem
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from core.constants import DEFAULT_PRODUCT_IMAGE_URL
import logging

logger = logging.getLogger("api")

# ============================================================
# 🧩 WISHLIST ITEM SERIALIZER
# ============================================================

class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Represents a single product in a user's wishlist.

    Returns nested product info that matches frontend DTO exactly:
    {
        "id": 10,
        "product_id": 3,
        "product": {
            "id": 3,
            "name": "Laptop Pro",
            "price": "1200.00",
            "stock": 0,
            "description": "Example desc",
            "image_url": "http://127.0.0.1:8000/media/products/default.jpg"
        }
    }
    """
    product = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ["id", "product_id", "product"]

    def get_product(self, obj):
        """
        Safely serialize related product, including fallback values.
        Returns None if product is missing.
        """
        try:
            product = Product.objects.filter(id=obj.product_id).first()
            if not product:
                logger.warning(f"[WishlistItem] Missing product ID={obj.product_id}")
                return None

            # Use ProductSerializer for consistency (already includes image_url)
            serialized = ProductSerializer(product, context=self.context).data

            # ✅ Ensure DTO compatibility
            return {
                "id": serialized.get("id"),
                "name": serialized.get("name", "Unknown Product"),
                "price": str(serialized.get("price", "0.00")),
                "stock": serialized.get("stock", 0),
                "description": serialized.get("description", ""),
                "image_url": serialized.get("image_url", DEFAULT_PRODUCT_IMAGE_URL),
            }

        except Exception as e:
            logger.error(f"[WishlistItem:get_product] Error: {str(e)}")
            return None


# ============================================================
# 🧩 WISHLIST SERIALIZER
# ============================================================

class WishlistSerializer(serializers.ModelSerializer):
    """
    Represents the user's wishlist with all items.
    Matches WishlistDTO shape for frontend mapping.
    """
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "items", "total_items"]

    def get_total_items(self, obj):
        """
        Return total number of items in the wishlist.
        """
        count = obj.items.count()
        logger.debug(f"[Wishlist:get_total_items] Wishlist ID={obj.id} | Count={count}")
        return count