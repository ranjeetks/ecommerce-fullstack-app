from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User
from apps.roles.models import Role

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)

        # ✅ Assign default CUSTOMER role
        from apps.roles.models import Role
        customer_role, _ = Role.objects.get_or_create(name="CUSTOMER")
        user.roles.add(customer_role)
        print("✅ RegisterSerializer.create called, role assigned")

        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]

class UserSerializer(serializers.ModelSerializer):
    #roles = RoleSerializer(many=True, read_only=True)
    roles = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["id", "email", "username","roles"]
    def get_roles(self, obj):
        return [{"id": role.id, "name": role.name} for role in obj.roles.all()]