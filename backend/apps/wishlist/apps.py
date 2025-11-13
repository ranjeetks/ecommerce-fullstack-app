from django.apps import AppConfig


class WishlistConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.wishlist"

#=== Added to trigger signal registration
    def ready(self):
        # import signal handlers
        import apps.wishlist.signals  # noqa: F401
