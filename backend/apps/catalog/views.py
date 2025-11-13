# apps/catalog/views.py

import os
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from .models import Product
from .serializers import ProductSerializer
from config.permissions import IsAdminOrReadOnly
from core.mixins import RequestContextMixin
from .swagger import product_schema
from .filters import ProductFilter  # ✅ custom filter for price/category filters
import logging
from core.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from .pagination import ProductPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser

logger = logging.getLogger("api")
from django.conf import settings


# ============================================================
# ⚙️ Pagination Configuration (Reusable for Product APIs)
# ============================================================
# class ProductPagination(PageNumberPagination):
#     """Custom pagination for product listing."""
#     page_size = DEFAULT_PAGE_SIZE  # ✅ default products per page
#     page_size_query_param = "page_size"
#     max_page_size = MAX_PAGE_SIZE


# ============================================================
# 🧩 PRODUCT VIEWSET — Handles CRUD, Filtering & Pagination
# ============================================================
@product_schema
class ProductViewSet(RequestContextMixin, viewsets.ModelViewSet):
    """
    API endpoint for managing products.

    ✅ Supports list, retrieve, create, update, delete
    ✅ Read-only for non-admin users
    ✅ Full text search, sorting, and filtering
    ✅ Paginated responses for both admin & shop views
    ✅ Auto-injected request context for image URLs
    """

    queryset = Product.objects.all().select_related()  # ⚡ optimized DB query
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ProductPagination
    parser_classes = [MultiPartParser, FormParser]  # ✅ accept file uploads

    # 🔍 Search, Filter, and Ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter  # ✅ custom filter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price", "created_at"]
    ordering = ["-created_at"]  # 📅 default newest-first sort

    # ============================================================
    # 📦 CRUD + Logging Enhancements
    # ============================================================
    def list(self, request, *args, **kwargs):
        """
        Returns a paginated, filterable list of products.
        Logs diagnostics such as count, user, and filters used.
        """
        response = super().list(request, *args, **kwargs)
        data = response.data

        count = (
            len(data.get("results", []))
            if isinstance(data, dict)
            else len(data)
        )

        logger.info(
            f"[ProductViewSet:list] User={request.user} | Count={count} | Filters={dict(request.query_params)}"
        )
        return response

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single product with diagnostic logging."""
        product = self.get_object()
        logger.info(f"[ProductViewSet:retrieve] Product ID={product.id} viewed by {request.user}")
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Called when an admin creates a new product — with deep Cloudinary diagnostics."""
        import os
        import cloudinary
        from django.conf import settings
        logger = logging.getLogger("api")

        # 🧩 Diagnostic: storage + settings info
        logger.info(f"[CloudinaryCheck] DEFAULT_FILE_STORAGE = {settings.DEFAULT_FILE_STORAGE}")
        logger.info(f"[CloudinaryCheck] Media root = {getattr(settings, 'MEDIA_ROOT', None)}")
        logger.info(f"[CloudinaryCheck] Cloudinary name = {os.getenv('CLOUDINARY_CLOUD_NAME')}")
        logger.info(f"[CloudinaryCheck] Cloudinary configured? {bool(cloudinary.config().cloud_name)}")

        # 🧩 Diagnostic: serializer field info
        image_field = serializer.validated_data.get("image")
        if image_field:
            logger.info(f"[Pre-Save] Image field type = {type(image_field)}")
            logger.info(f"[Pre-Save] Image field name = {getattr(image_field, 'name', None)}")
            try:
                storage_used = getattr(image_field, 'storage', None)
                logger.info(f"[Pre-Save] Image field storage = {storage_used}")
            except Exception as e:
                logger.warning(f"[Pre-Save] Could not inspect image.storage: {e}")
        else:
            logger.warning("[Pre-Save] No image provided in validated_data")

        # 🧩 Save product to DB (triggers actual Cloudinary upload)
        product = serializer.save()

        # 🧩 Post-save diagnostics
        try:
            logger.info(f"[Post-Save] Product.image.url = {getattr(product.image, 'url', None)}")
            logger.info(f"[Post-Save] Product.image.name = {getattr(product.image, 'name', None)}")
        except Exception as e:
            logger.warning(f"[Post-Save] Could not log image URL: {e}")

        logger.info(f"[ProductViewSet:create] Product ID={product.id} created by {self.request.user}")
        return product


    def perform_update(self, serializer):
        """Called when an admin updates a product."""
        product = serializer.save()
        logger.info(f"[ProductViewSet:update] Product ID={product.id} updated by {self.request.user}")
        return product

    def perform_destroy(self, instance):
        """Called when an admin deletes a product."""
        logger.warning(f"[ProductViewSet:delete] Product ID={instance.id} deleted by {self.request.user}")
        instance.delete()
    
    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]