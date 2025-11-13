from rest_framework import serializers

class CreatePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=True)
    amount = serializers.IntegerField(required=True)