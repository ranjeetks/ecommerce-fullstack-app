# apps/payments/views.py
import stripe
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from apps.orders.models import Order
from apps.cart.models import Cart, CartItem
import json
from drf_spectacular.utils import extend_schema
from .serializers import CreatePaymentIntentSerializer  # ✅ ensure serializer added

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Use your centralized logger
logger = logging.getLogger("api")


# ============================================================
# 1️⃣ Create Payment Intent (Authenticated Users)
# ============================================================
@extend_schema(
    request=CreatePaymentIntentSerializer,  # ✅ enables Swagger input box
    responses={200: dict},
    description="Create Stripe Payment Intent (requires order_id and amount)"
)
class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logger.info("🔥 [CreatePaymentIntentView] Invoked by user=%s", user)

        # 🔐 Optional: Restrict direct API access in production
        # Set DEBUG=True in production (like Render) temporarily for testing.otherwise this will block on swagger and postman
        #  to direct call to API  requests.
        # Uncomment below code when you want that that Direct API access not allowed.
        # if not settings.DEBUG:
        #     allowed_origins = ["https://rs-ecommerce-frontend.vercel.app/"]
        #     origin = request.META.get("HTTP_ORIGIN")

        #     if origin not in allowed_origins:
        #         logger.warning(f"⚠️ Unauthorized origin attempted: {origin}")
        #         return Response({"error": "Direct API access not allowed"}, status=403)

        try:
            data = request.data
            if not data:
                data = json.loads(request.body.decode("utf-8"))
        except Exception:
            data = {}
        logger.info(f"🧾 [Stripe] Request data received: {request.data}")
        print("🧾 Stripe data:", request.data)

        order_id = data.get("order_id")
        amount = data.get("amount")

        #order_id = request.data.get("order_id")
        #amount = request.data.get("amount")

        logger.info("📦 Payload received | order_id=%s | amount=%s", order_id, amount)

        if not order_id:
            logger.warning("⚠️ Missing 'order_id' | user=%s", user)
            return Response({"error": "Order ID required"}, status=400)

        # Validate and fetch order
        order = get_object_or_404(Order, id=order_id, user=user)
        total_paise = int(order.total_amount * 100)

        if total_paise < 5000:
            logger.warning("⚠️ Minimum payment threshold not met | total=%s | user=%s", order.total_amount, user)
            return Response({"error": "Minimum charge is ₹50"}, status=400)

        try:
            # Create Stripe PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=total_paise,
                currency="inr",
                metadata={"order_id": order.id, "user_id": user.id},
            )

            # Save Stripe intent ID in DB
            order.payment_id = intent.id
            order.save(update_fields=["payment_id"])

            logger.info(
                "💳 Stripe PaymentIntent created | user=%s | order_id=%s | amount=%s | intent_id=%s",
                user, order.id, total_paise, intent.id
            )

            return Response({"clientSecret": intent.client_secret}, status=200)

        except stripe.error.StripeError as e:
            logger.error("❌ Stripe API error | user=%s | error=%s", user, str(e))
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.exception("💥 Unexpected error in CreatePaymentIntentView | user=%s", user)
            return Response({"error": "Payment processing failed"}, status=500)


# ============================================================
# 2️⃣ Stripe Webhook (Confirm Payment → Mark Order Paid)
# ============================================================
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        logger.warning("⚠️ Stripe signature verification failed.")
        return HttpResponse(status=400)

    event_type = event.get("type")
    logger.info(f"📦 Stripe webhook event received: {event_type}")

    if event_type == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        payment_id = payment_intent.get("id")
        metadata = payment_intent.get("metadata", {})
        order_id = metadata.get("order_id")
        user_id = metadata.get("user_id")

        logger.info(f"💰 Payment success | payment_id={payment_id} | metadata={metadata}")

        try:
            order = Order.objects.get(id=int(order_id))
            order.status = "PAID"
            order.payment_id = payment_id
            order.save(update_fields=["status", "payment_id"])
            logger.info(f"✅ Order marked PAID | order_id={order_id}")

            # Clear cart if user_id exists
            if user_id:
                Cart.objects.filter(user_id=user_id).delete()
                logger.info(f"🧹 Cart cleared for user_id={user_id}")

        except Exception as e:
            logger.error(f"❌ Failed to update order | order_id={order_id} | error={e}")

    elif event_type == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        payment_id = payment_intent.get("id")
        logger.warning(f"❌ Payment failed | payment_id={payment_id}")

    return HttpResponse(
        json.dumps({"status": "processed"}),
        content_type="application/json",
        status=200
    )