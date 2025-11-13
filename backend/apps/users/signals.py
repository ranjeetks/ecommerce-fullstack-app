# apps/users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.roles.models import Role

User = get_user_model()

@receiver(post_save, sender=User)
def assign_roles(sender, instance, created, **kwargs):
    if created:
        if instance.is_superuser:
            # superusers only get ADMIN
            admin_role, _ = Role.objects.get_or_create(name="ADMIN")
            instance.roles.add(admin_role)
        else:
            # normal users get CUSTOMER
            customer_role, _ = Role.objects.get_or_create(name="CUSTOMER")
            instance.roles.add(customer_role)