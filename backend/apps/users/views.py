from rest_framework import status, generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import render

from .models import User
from .serializers import RegisterSerializer, UserSerializer
from .swagger import (
    register_schema,
    me_schema,
    logout_schema,
    protected_schema
)

User = get_user_model()


# ✅ /api/auth/register/
@register_schema
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ✅ /api/auth/me/
@me_schema
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Prefetch roles if needed
        return User.objects.prefetch_related("roles").get(id=self.request.user.id)


# ✅ /api/auth/logout/
@logout_schema
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Invalidate refresh token (SimpleJWT Blacklist)
        """
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully."},
                            status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid token."},
                            status=status.HTTP_400_BAD_REQUEST)


# ✅ /api/auth/protected/  (OPTIONAL, good for testing auth)
@protected_schema
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": f"Hello {request.user.username}, this is a protected API!",
            "user": request.user.username,
            "authenticated": True
        })


# ✅ Optional: Keep home view as is (not under /api/)
def home_view(request):
    """
    Renders the global Home.html template.
    """
    return render(request, "Home.html")