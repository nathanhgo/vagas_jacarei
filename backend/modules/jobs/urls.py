from django.urls import path

from .views import (
    CompanyJobsAPIView,
    JobCandidacyAPIView,
    JobDetailAPIView,
    JobListAPIView,
)

app_name = "jobs"

urlpatterns = [
    path("", JobListAPIView.as_view(), name="job-list"),
    path("my-jobs/", CompanyJobsAPIView.as_view(), name="company-jobs"),
    path("<int:pk>/", JobDetailAPIView.as_view(), name="job-detail"),
    path("<int:pk>/apply/", JobCandidacyAPIView.as_view(), name="job-apply"),
]
