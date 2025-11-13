# payments/views_stripe.py
import stripe
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
def create_payment_intent(request):
    try:
        print("Creating payment intent...by Ranjeet Singh")
        amount = request.data.get("amount")  # in paise (₹1 = 100 paise)
        if not amount:
            return Response({"error": "Amount required"}, status=400)
        intent = stripe.PaymentIntent.create(
            amount=amount,   # ₹999.00 in paisa
            currency="inr", # or "usd"
            metadata={"product_id": "test-product-1"}
        )
        return Response({"clientSecret": intent.client_secret})
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        print("💰 Payment succeeded:", payment_intent["id"])

    return HttpResponse(status=200)