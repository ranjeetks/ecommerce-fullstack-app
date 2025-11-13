from django.db import models
from django.core.exceptions import ValidationError
from cloudinary_storage.storage import MediaCloudinaryStorage

def validate_image_size(image):
    max_size_mb = 2
    if image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image size should not exceed {max_size_mb}MB")
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(storage=MediaCloudinaryStorage(),upload_to='products/', blank=True, null=True,default='products/default.png')  # ✅ NEW FIELD

    class Meta:
        ordering = ['name']  # default sort by name

    def __str__(self):
        return self.name
