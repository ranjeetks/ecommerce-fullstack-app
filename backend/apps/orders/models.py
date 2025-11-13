# orders/models.py
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        PAID = "PAID", _("Paid")
        FAILED = "FAILED", _("Failed")
        CANCELED = "CANCELED", _("Canceled")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("Payment session or transaction ID from Stripe/Razorpay."),
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")

    def __str__(self):
        return f"Order #{self.id} ({self.status}) by {self.user}"

    # -------------------------
    # 🔹 Convenience Methods
    # -------------------------
    @property
    def is_paid(self):
        return self.status == self.Status.PAID

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_id = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")

    def __str__(self):
        return f"{self.quantity} × Product {self.product_id} (Order #{self.order_id})"

    # -------------------------
    # 🔹 Subtotal Helper
    # -------------------------
    @property
    def subtotal(self):
        return self.quantity * self.price