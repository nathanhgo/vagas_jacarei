from django.urls import path
from .views import CompanyListAPIView, CompanyDetailAPIView

app_name = "companies"

urlpatterns = [
    path("", CompanyListAPIView.as_view(), name="company-list"),
    path("<int:pk>/", CompanyDetailAPIView.as_view(), name="company-detail"),
]
