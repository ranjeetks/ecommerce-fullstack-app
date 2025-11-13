# apps/users/swagger.py

from drf_spectacular.utils import (
    extend_schema, extend_schema_view,
    OpenApiExample, OpenApiResponse, inline_serializer
)
from core.swagger.tags import AUTH_TAG
from rest_framework import serializers
from .serializers import RegisterSerializer

# ✅ Register (POST /api/auth/register/)
register_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Register a new user",
    description="Create a new user account with email, password, and other required fields."
)

# ✅ Login (POST /api/auth/token/)
# ✅ LOGIN (/api/auth/token/) — full enterprise polish
login_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Login and obtain JWT tokens",
    description="Authenticate a user using **username** and **password**. Returns an access & refresh token pair.",
    request=inline_serializer(
        name="LoginRequest",
        fields={
            "username": serializers.CharField(help_text="Username of the user"),
            "password": serializers.CharField(write_only=True, help_text="User password"),
        },
    ),
    responses={
        200: OpenApiResponse(
            response=inline_serializer(
                name="TokenPair",
                fields={
                    "access": serializers.CharField(),
                    "refresh": serializers.CharField(),
                },
            ),
            description="Successful authentication. Use the **access** token in the `Authorization: Bearer <token>` header."
        ),
        400: OpenApiResponse(
            description="Bad Request – missing/invalid fields.",
            examples=[
                OpenApiExample(
                    "Missing username",
                    value={"username": ["This field is required."]},
                    status_codes=["400"],
                    response_only=True,
                )
            ],
        ),
        401: OpenApiResponse(
            description="Unauthorized – invalid credentials.",
            examples=[
                OpenApiExample(
                    "Invalid credentials",
                    value={"detail": "No active account found with the given credentials"},
                    status_codes=["401"],
                    response_only=True,
                )
            ],
        ),
    },
    examples=[
        OpenApiExample(
            "Valid login",
            value={"username": "john_doe", "password": "Password123"},
            request_only=True,
        ),
        OpenApiExample(
            "Successful response",
            value={
                "access": "eyJ0eXAiOiJKV1QiLCJh...access...",
                "refresh": "eyJhbGciOiJIUzI1NiIsInR5...refresh..."
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
)

# ✅ REFRESH TOKEN (/api/auth/token/refresh/)
refresh_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Refresh JWT tokens",
    description=(
        "Use a valid **refresh** token to obtain a new **access** token. "
        "In this implementation, a **new refresh token is also returned.**"
    ),
    request=inline_serializer(
        name="TokenRefreshRequest",
        fields={
            "refresh": serializers.CharField(help_text="Valid refresh token"),
        },
    ),
    responses={
        200: OpenApiResponse(
            response=inline_serializer(
                name="TokenRefreshResponse",
                fields={
                    "access": serializers.CharField(),
                    "refresh": serializers.CharField(),
                },
            ),
            description="New access and refresh tokens returned successfully."
        ),
        400: OpenApiResponse(
            description="Refresh token missing or invalid.",
            examples=[
                OpenApiExample(
                    "Invalid token",
                    value={"detail": "Token is invalid or expired"},
                    status_codes=["400"],
                    response_only=True
                )
            ]
        ),
    },
    examples=[
        OpenApiExample(
            "Valid request",
            value={"refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
            request_only=True
        ),
        OpenApiExample(
            "Successful response",
            value={
                "access": "new_access_token_here",
                "refresh": "new_refresh_token_here"
            },
            response_only=True,
            status_codes=["200"]
        ),
    ]
)

# ✅ Refresh Token (POST /api/auth/token/refresh/)
# ✅ REGISTER (/api/auth/register/)
register_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Register a new user",
    description="Create a new user account using username, email (optional), and password.",
    request=RegisterSerializer,  # ✅ Uses your existing serializer
    responses={
        201: OpenApiResponse(
            response=inline_serializer(
                name="RegisterResponse",
                fields={
                    "id": serializers.IntegerField(),
                    "username": serializers.CharField(),
                    "email": serializers.EmailField(required=False),
                },
            ),
            description="User registered successfully."
        ),
        400: OpenApiResponse(
            description="Validation errors or missing fields.",
            examples=[
                OpenApiExample(
                    "Username taken",
                    value={"username": ["This username is already taken."]},
                    status_codes=["400"],
                    response_only=True
                )
            ]
        ),
    },
    examples=[
        OpenApiExample(
            "Valid request",
            value={
                "username": "john_doe",
                "email": "john@example.com",
                "password": "Password123"
            },
            request_only=True
        ),
        OpenApiExample(
            "Success response",
            value={
                "id": 1,
                "username": "john_doe",
                "email": "john@example.com"
            },
            response_only=True,
            status_codes=["201"]
        ),
    ]
)

# ✅ Get current user (GET /api/auth/me/)
me_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Get current user",
    description="Retrieve the authenticated user’s profile information."
)

# ✅ Logout (POST /api/auth/logout/)
logout_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Logout user",
    description="Invalidate the user's refresh token or perform logout."
)

# ✅ Protected test route (GET /api/auth/protected/)
# (Useful for debugging or demonstration)
protected_schema = extend_schema(
    tags=AUTH_TAG,
    summary="Test authentication",
    description="A sample endpoint that requires JWT token to access."
)