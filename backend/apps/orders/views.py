# apps/orders/views.py
import stripe
from django.conf import settings
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes

from .models import Order, OrderItem
from apps.cart.models import Cart
from apps.catalog.models import Product
from .serializers import OrderSerializer
from .swagger import confirm_order_schema, my_orders_schema
from core.mixins import RequestContextMixin
from core.utils.logger.backend_logger import setup_logger

logger = setup_logger("api")

stripe.api_key = settings.STRIPE_SECRET_KEY


# ============================================================
# 🧩 1️⃣ CONFIRM ORDER — Create order from Cart
# ============================================================
@confirm_order_schema
class ConfirmOrderView(RequestContextMixin, APIView):
    """
    Converts user's Cart into a confirmed Order (status=PENDING).
    This step is before payment.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logger.info(f"[ConfirmOrderView] User {user} attempting to confirm order.")

        try:
            # 1️⃣ Fetch user's cart
            cart = get_object_or_404(Cart, user=user)
            cart_items = cart.items.all()

            if not cart_items.exists():
                logger.warning(f"[ConfirmOrderView] Empty cart for user {user}")
                return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

            # 2️⃣ Create a new pending order
            order = Order.objects.create(user=user, total_amount=0, status="PENDING")
            total = 0

            # 3️⃣ Move cart items → OrderItems
            for item in cart_items:
                product = Product.objects.filter(id=item.product_id).first()
                if not product:
                    logger.error(f"[ConfirmOrderView] Product {item.product_id} not found for user {user}")
                    return Response({"error": f"Product {item.product_id} not found"}, status=404)

                price = product.price
                total += price * item.quantity

                OrderItem.objects.create(
                    order=order,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=price,
                )

            # 4️⃣ Update totals and clear cart
            order.total_amount = total
            order.save()
            
            #cart_items.delete()

            logger.info(
                f"[ConfirmOrderView] User {user} confirmed order #{order.id} | Total={total}"
            )

            return Response(
                {
                    "message": "✅ Order confirmed successfully",
                    "order_id": order.id,
                    "total": total,
                    "status": order.status,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.exception(f"[ConfirmOrderView] Error for user {user}: {str(e)}")
            return Response({"error": "Order confirmation failed."}, status=500)


# ============================================================
# 🧩 2️⃣ CHECKOUT — Create Stripe session for a confirmed order
# ============================================================
class CheckoutView(RequestContextMixin, APIView):
    """
    Creates Stripe checkout session for a confirmed Order.
    Updates payment_id field with Stripe session ID.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        order_id = request.data.get("order_id")

        order = get_object_or_404(Order, id=order_id, user=user)

        # Prevent multiple payments for same order
        if order.status != "PENDING":
            return Response({"error": "Order is not pending or already paid."}, status=400)

        line_items = []
        for item in order.items.all():
            product = Product.objects.filter(id=item.product_id).first()
            if not product:
                continue
            line_items.append({
                "price_data": {
                    "currency": "inr",
                    "product_data": {"name": product.name},
                    "unit_amount": int(item.price * 100),
                },
                "quantity": item.quantity,
            })

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=settings.FRONTEND_SUCCESS_URL,
                cancel_url=settings.FRONTEND_CANCEL_URL,
                metadata={"order_id": order.id, "user_id": user.id},
            )
        except Exception as e:
            logger.exception(f"[CheckoutView] Stripe session failed for order {order.id}: {str(e)}")
            return Response({"error": "Failed to create Stripe session."}, status=500)

        # Save session ID to order
        order.payment_id = session.id
        order.save(update_fields=["payment_id"])

        logger.info(f"[CheckoutView] Stripe session created for order #{order.id}")

        return Response(
            {"sessionId": session.id, "checkout_url": session.url},
            status=status.HTTP_200_OK,
        )


# ============================================================
# 🧩 3️⃣ STRIPE WEBHOOK — Confirm payment success
# ============================================================
@api_view(["POST"])
@permission_classes([])
def stripe_webhook(request):
    """
    Handles Stripe checkout.session.completed event
    and updates order status to PAID.
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        logger.warning(f"[StripeWebhook] Invalid payload or signature: {e}")
        return Response(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        payment_id = session.get("id")

        order = Order.objects.filter(payment_id=payment_id).first()
        if order and order.status == "PENDING":
            order.status = "PAID"
            order.save(update_fields=["status"])
            logger.info(f"[StripeWebhook] Order #{order.id} marked as PAID")

    return Response(status=200)


# ============================================================
# 🧩 4️⃣ MY ORDERS — List all user orders
# ============================================================
@my_orders_schema
class MyOrdersView(RequestContextMixin, generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # 👈 disables pagination only for this view

    def get_queryset(self):
        user = self.request.user
        logger.info(f"[MyOrdersView] Fetching orders for {user}")

        qs = Order.objects.filter(user=user).order_by("-created_at")

        # Filters
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        date_str = self.request.query_params.get("date")
        if date_str:
            date_obj = parse_date(date_str)
            if date_obj:
                qs = qs.filter(created_at__date=date_obj)

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count = len(response.data.get("results", [])) if isinstance(response.data, dict) else len(response.data)
        logger.info(f"[MyOrdersView] Returned {count} orders for {request.user}")
        return response