# cart_wishlist/models.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL    

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlists")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist of {self.user.username}"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name="items")
    product_id = models.PositiveIntegerField()  # Store product ID instead of ForeignKey

    class Meta:
        unique_together = ("wishlist", "product_id")

    def __str__(self):
        return f"Product {self.product_id} in wishlist of {self.wishlist.user.username}"