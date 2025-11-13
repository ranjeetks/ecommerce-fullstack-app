from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.roles.models import Role

class User(AbstractUser):
    # Extra fields for ecommerce (if needed later: phone, address, etc.)
    roles = models.ManyToManyField(Role, related_name="users", blank=True)

    def has_role(self, role_name):
        return self.roles.filter(name=role_name).exists()