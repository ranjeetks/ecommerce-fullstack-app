# frontend_logs/urls.py
from django.urls import path
from .views import FrontendLogView

urlpatterns = [
    path("api/frontend-logs/", FrontendLogView.as_view(), name="frontend-logs"),
]