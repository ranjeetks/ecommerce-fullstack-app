# cart_wishlist/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Cart
    path("", views.CartView.as_view(), name="cart"),
    path("add/<int:product_id>/", views.AddToCartView.as_view(), name="cart-add"),
    path("remove/<int:pk>/", views.RemoveFromCartView.as_view(), name="cart-remove"),
]