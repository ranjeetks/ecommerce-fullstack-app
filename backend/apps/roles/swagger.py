# apps/roles/swagger.py

from drf_spectacular.utils import extend_schema, extend_schema_view
from core.swagger.tags import ROLE_TAG

role_schema = extend_schema_view(
    list=extend_schema(
        tags=ROLE_TAG,
        summary="List roles",
        description="Retrieve a list of all roles (admin only)."
    ),
    retrieve=extend_schema(
        tags=ROLE_TAG,
        summary="Get role details",
        description="Retrieve details of a specific role."
    ),
    create=extend_schema(
        tags=ROLE_TAG,
        summary="Create role",
        description="Create a new role (admin only)."
    ),
    update=extend_schema(
        tags=ROLE_TAG,
        summary="Update role",
        description="Update a role (admin only)."
    ),
    partial_update=extend_schema(
        tags=ROLE_TAG,
        summary="Partially update role",
        description="Update certain fields of a role."
    ),
    destroy=extend_schema(
        tags=ROLE_TAG,
        summary="Delete role",
        description="Delete a role (admin only)."
    ),
)