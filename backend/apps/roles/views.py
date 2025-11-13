from rest_framework import viewsets, permissions
from .models import Role
from .serializers import RoleSerializer
from .swagger import role_schema

@role_schema
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]
