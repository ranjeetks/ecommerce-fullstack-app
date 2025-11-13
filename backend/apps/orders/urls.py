# apps/orders/urls.py
from django.urls import path
from .views import (
    ConfirmOrderView,
    CheckoutView,
    stripe_webhook,
    MyOrdersView,
)

urlpatterns = [
    path("confirm/", ConfirmOrderView.as_view(), name="confirm-order"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),  # 🆕 Stripe session creation
    path("webhook/stripe/", stripe_webhook, name="stripe-webhook"),  # 🆕 webhook
    path("my/", MyOrdersView.as_view(), name="my-orders"),
]