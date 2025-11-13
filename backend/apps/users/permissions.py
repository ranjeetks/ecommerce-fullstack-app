from rest_framework import permissions

class HasRole(permissions.BasePermission):
    def __init__(self, role_name):
        self.role_name = role_name

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.roles.filter(name=self.role_name).exists()
        )

class IsAdmin(HasRole):
    def __init__(self):
        super().__init__("ADMIN")

class IsSeller(HasRole):
    def __init__(self):
        super().__init__("SELLER")