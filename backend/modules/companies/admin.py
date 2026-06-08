from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "cnpj", "email", "phone", "is_verified", "created_at")
    list_filter = ("is_verified", "created_at")
    search_fields = ("name", "cnpj", "email")
    readonly_fields = ("created_at", "id")
    fieldsets = (
        (
            "Informações Básicas",
            {"fields": ("name", "cnpj", "email", "alternative_email", "phone")},
        ),
        ("Endereço", {"fields": ("address", "complement", "cep", "neighborhood")}),
        ("Descrição", {"fields": ("description",)}),
        ("Status", {"fields": ("is_verified",)}),
        ("Data de Criação", {"fields": ("created_at",), "classes": ("collapse",)}),
    )
