# cart_wishlist/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Wishlist
    path("", views.WishlistView.as_view(), name="wishlist"),
    path("add/<int:product_id>/", views.AddToWishlistView.as_view(), name="wishlist-add"),
    path("remove/<int:pk>/", views.RemoveFromWishlistView.as_view(), name="wishlist-remove"),
]