# apps/users/urls.py

from django.urls import path
from .views import (
    RegisterView,
    CurrentUserView,
    LogoutView,
    ProtectedView,  # ✅ new class-based version
)
from .custom_jwt_views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token-obtain"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token-refresh"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("protected/", ProtectedView.as_view(), name="auth-protected"),
]