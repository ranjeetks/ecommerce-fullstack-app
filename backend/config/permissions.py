# core/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    """Allow only Admins"""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.roles.filter(name="ADMIN").exists()
        )

class IsCustomer(BasePermission):
    """Allow only Customers"""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.roles.filter(name="CUSTOMER").exists()
        )

class ReadOnly(BasePermission):
    """Allow only safe methods: GET, HEAD, OPTIONS"""
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    """Admins have full access, others read-only"""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.roles.filter(name="ADMIN").exists()
        )
