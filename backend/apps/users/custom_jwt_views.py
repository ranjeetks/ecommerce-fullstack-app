# apps/users/custom_jwt_views.py

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .swagger import login_schema, refresh_schema
from .token_serializers import CustomTokenObtainPairSerializer  # ✅ You already have this


@login_schema
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view to obtain JWT tokens.
    Uses CustomTokenObtainPairSerializer if needed.
    """
    serializer_class = CustomTokenObtainPairSerializer  # ✅ keep your logic


@refresh_schema
class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom refresh view to refresh access token.
    """
    pass  # uses default serializer