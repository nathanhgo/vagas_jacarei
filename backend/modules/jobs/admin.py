from django.contrib import admin

from .models import Candidacy, Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "type_of_contract",
        "status",
        "created_at",
    )
    list_filter = ("type_of_contract", "status", "created_at")
    search_fields = ("title", "company__name", "description")


@admin.register(Candidacy)
class CandidacyAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "job", "created_at")
    list_filter = ("created_at",)
    search_fields = ("full_name", "email", "job__title")
