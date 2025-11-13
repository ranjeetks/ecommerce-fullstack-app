"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from apps.users.views import home_view
from django.conf.urls.static import static
from django.conf import settings
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    #path("", root_view, name="root"),
    path('', home_view, name='home_view'), 
    path('admin/', admin.site.urls),
    # Auth   root route: /api/auth/
    path("api/auth/", include("apps.users.urls")),
    # Role management API (optional, only if you created apps/roles/urls.py)
    path("api/roles/", include("apps.roles.urls")),
    # Catalog   root route: /api/catalog/
    path("api/products/", include("apps.catalog.urls")),
    # Cart & Wishlist APIs
    path("api/cart/", include("apps.cart.urls")),
    path("api/wishlist/", include("apps.wishlist.urls")),
    path("api/stripe/", include("apps.payments.urls")),  
    path("api/orders/", include("apps.orders.urls")),
    path("api/frontend_logs/", include("apps.frontend_logs.urls")),   # will expose /api/frontend-logs/

    # Swagger   API schema and documentation URL
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# we are using to Cloudinary, Django no longer needs to manage /media locally.so it commented
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

