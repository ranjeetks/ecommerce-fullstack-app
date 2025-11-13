# apps/payments/swagger.py

from drf_spectacular.utils import extend_schema
from core.swagger.tags import PAYMENT_TAG

create_payment_intent_schema = extend_schema(
    tags=PAYMENT_TAG,
    summary="Create Stripe payment intent",
    description=(
        "Generates a Stripe payment intent for the authenticated user. "
        "This is typically used during checkout to prepare a payment."
    )
)