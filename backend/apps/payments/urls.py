from django.urls import path
from .views import CreatePaymentIntentView, stripe_webhook
#from .views_stripe import create_payment_intent, stripe_webhook

urlpatterns = [
     # Stripe   --.views_stripe
    #path("create-payment-intent/", create_payment_intent, name="create-payment-intent"),
    #path("webhook/", stripe_webhook, name="stripe-webhook"),
    
    # Stripe -- .views
        
    path("create-payment-intent/", CreatePaymentIntentView.as_view(), name="create_payment_intent"),
    path("webhook/", stripe_webhook, name="stripe_webhook"),

    # Razorpay
    #path("razorpay/create-order/", create_order, name="create-order"),
    #path("razorpay/webhook/", razorpay_webhook, name="razorpay-webhook"),
]