from django.urls import path
from .views import JobListAPIView, JobDetailAPIView

app_name = "jobs"

urlpatterns = [
    path("", JobListAPIView.as_view(), name="job-list"),
    path("<int:pk>/", JobDetailAPIView.as_view(), name="job-detail"),
]
