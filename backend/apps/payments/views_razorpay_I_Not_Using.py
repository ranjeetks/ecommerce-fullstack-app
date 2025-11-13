# payments/views_razorpay.py
import os, hmac, hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import razorpay
from django.http import JsonResponse

client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

class CreateRazorpayOrder(APIView):
    def post(self, request):
        amount = request.data.get("amount") or 99900  # paise
        order = client.order.create({"amount": amount, "currency": "INR", "payment_capture": 1})
        # return the order object (id, amount, currency)
        return Response({"order": order})

class VerifyRazorpayPayment(APIView):
    def post(self, request):
        payload = request.data
        razorpay_order_id = payload.get("razorpay_order_id")
        razorpay_payment_id = payload.get("razorpay_payment_id")
        razorpay_signature = payload.get("razorpay_signature")
        secret = os.getenv("RAZORPAY_KEY_SECRET")
        generated_signature = hmac.new(
            secret.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        if generated_signature == razorpay_signature:
            # mark order paid
            return Response({"status": "ok"})
        return Response({"status": "invalid signature"}, status=status.HTTP_400_BAD_REQUEST)
    
def create_order(request):
    """Create a Razorpay order"""
    order_data = {
        "amount": 50000,  # amount in paise (50000 = ₹500)
        "currency": "INR",
        "payment_capture": "1"
    }
    order = client.order.create(order_data)
    return JsonResponse(order)

def razorpay_webhook(request):
    """Handle Razorpay webhook"""
    return JsonResponse({"status": "webhook received"})