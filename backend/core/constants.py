# core/constants.py
from django.conf import settings
# ✅ Default image URLs
DEFAULT_PRODUCT_IMAGE_URL = getattr(
    settings,
    "DEFAULT_PRODUCT_IMAGE_URL",
    "/media/products/default.jpg",
)

# ✅ Common messages (if you want to add later)
ORDER_SUCCESS_MESSAGE = "Order placed successfully!"
ORDER_FAILURE_MESSAGE = "There was a problem processing your order."

# ✅ Common statuses (example)
ORDER_STATUS_PENDING = "pending"
ORDER_STATUS_COMPLETED = "completed"
ORDER_STATUS_CANCELLED = "cancelled"

# ✅ Any other reusable project-wide constants
MAX_UPLOAD_SIZE_MB = 5
SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"]

# 🧾 Pagination defaults
DEFAULT_PAGE_SIZE = 8
MAX_PAGE_SIZE = 50