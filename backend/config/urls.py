"""Root URL configuration for the Jacareí Vagas project."""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API endpoints
    path("api/", include("core.urls")),

    # --- API Documentation ---
    # Schema bruto (JSON/YAML) — usado pelo Swagger e ReDoc internamente
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Swagger UI — interface interativa para testar endpoints
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # ReDoc — documentação alternativa, mais legível
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
