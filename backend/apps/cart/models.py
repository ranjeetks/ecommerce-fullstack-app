# cart_wishlist/models.py
from django.conf import settings
from django.db import models
from apps.catalog.models import Product

User = settings.AUTH_USER_MODEL

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart ({self.user})"
    
    def get_total(self):
        total = 0
        for item in self.items.all():
            try:
                product = Product.objects.get(id=item.product_id)
                total += product.price * item.quantity
            except Product.DoesNotExist:
                continue
        return total

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")  # ✅ added relation
    product_id = models.IntegerField()  # store product id only
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Product {self.product_id} (x{self.quantity}) in {self.cart.user}"