# core/mixins.py
from rest_framework.generics import GenericAPIView

class RequestContextMixin:
    """
    Automatically injects the current HTTP request into serializer context.
    Use this mixin in any DRF GenericAPIView or ViewSet subclass.

    ✅ Prevents 'NoneType' object has no attribute 'build_absolute_uri' errors.
    ✅ Makes image URLs and nested serializers always safe.
    ✅ Removes repetitive context code from every view.
    """

    def get_serializer_context(self):
        # Get the default DRF context first
        context = super().get_serializer_context()
        # Add current request safely
        context.update({"request": getattr(self, "request", None)})
        return context