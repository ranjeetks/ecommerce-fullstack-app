# apps/catalog/swagger.py

from drf_spectacular.utils import extend_schema, extend_schema_view
from core.swagger.tags import PRODUCT_TAG

# You can add more detailed descriptions as needed
product_schema = extend_schema_view(
    list=extend_schema(
        tags=PRODUCT_TAG,
        summary="List all products",
        description="Retrieve a list of all available products."
    ),
    retrieve=extend_schema(
        tags=PRODUCT_TAG,
        summary="Retrieve product details",
        description="Get detailed information of a specific product by ID."
    ),
    create=extend_schema(
        tags=PRODUCT_TAG,
        summary="Create a new product",
        description="Create a new product. Admin access required."
    ),
    update=extend_schema(
        tags=PRODUCT_TAG,
        summary="Update a product",
        description="Update an existing product. Admin access required."
    ),
    partial_update=extend_schema(
        tags=PRODUCT_TAG,
        summary="Partially update a product",
        description="Update some fields of a product. Admin access required."
    ),
    destroy=extend_schema(
        tags=PRODUCT_TAG,
        summary="Delete a product",
        description="Delete a product by ID. Admin access required."
    )
)