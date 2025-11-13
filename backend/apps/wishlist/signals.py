# cart_wishlist/signals.py
# Signals for logging events related to Wishlist and Cart items.
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.utils.logger.backend_logger import setup_logger
from .models import WishlistItem

logger = setup_logger("cart_wishlist.signals")

@receiver(post_save, sender=WishlistItem)
def on_wishlist_item_saved(sender, instance, created, **kwargs):
    if not created:
        return
    user = getattr(instance.wishlist, "user", None)
    username = getattr(user, "username", "Unknown") if user else "Unknown"
    logger.info(f"event=wishlist_item_created user={username} product_id={instance.product_id}")

# @receiver(post_save, sender=CartItem)
# def on_cart_item_saved(sender, instance, created, **kwargs):
#     if not created:
#         return
#     user = getattr(instance.cart, "user", None)
#     username = getattr(user, "username", "Unknown") if user else "Unknown"
#     logger.info(f"event=cart_item_created user={username} product_id={instance.product_id}")