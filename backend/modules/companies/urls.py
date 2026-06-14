from django.urls import path

from .views import CompanyDetailAPIView, CompanyListAPIView, CompanyLoginAPIView, CompanyGoogleAuthAPIView

app_name = "companies"

urlpatterns = [
    path("", CompanyListAPIView.as_view(), name="company-list"),
    path("login/", CompanyLoginAPIView.as_view(), name="company-login"),
    path("google-auth/", CompanyGoogleAuthAPIView.as_view(), name="company-google-auth"),
    path("<int:pk>/", CompanyDetailAPIView.as_view(), name="company-detail"),
]
