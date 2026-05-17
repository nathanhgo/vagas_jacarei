"""Core app views."""

import django
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response


@extend_schema(
    summary="Health-check da API",
    description=(
        "Verifica se o backend está operacional. "
        "Retorna uma mensagem 'pong' junto com a versão do Django em execução."
    ),
    responses={
        200: OpenApiResponse(
            description="API operacional",
            response={
                "type": "object",
                "properties": {
                    "message": {"type": "string", "example": "pong"},
                    "status": {"type": "string", "example": "ok"},
                    "django_version": {"type": "string", "example": "5.1.6"},
                },
            },
        )
    },
    tags=["core"],
)
@api_view(["GET"])
def ping(request):
    """Health-check endpoint. Returns a pong response with server info."""
    return Response(
        {
            "message": "pong",
            "status": "ok",
            "django_version": django.__version__,
        }
    )
