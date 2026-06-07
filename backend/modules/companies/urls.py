from django.urls import path
from .views import CompanyListAPIView, CompanyDetailAPIView, CompanyLoginAPIView

app_name = "companies"

urlpatterns = [
    path("", CompanyListAPIView.as_view(), name="company-list"),
    path("login/", CompanyLoginAPIView.as_view(), name="company-login"),
    path("<int:pk>/", CompanyDetailAPIView.as_view(), name="company-detail"),
]
