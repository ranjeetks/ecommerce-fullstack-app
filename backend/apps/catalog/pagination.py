# apps/products/pagination.py
from rest_framework.pagination import PageNumberPagination
from core.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

class ProductPagination(PageNumberPagination):
    """Custom pagination for product listing."""
    page_size = DEFAULT_PAGE_SIZE  # ✅ default products per page
    page_size_query_param = "page_size"
    max_page_size = MAX_PAGE_SIZE