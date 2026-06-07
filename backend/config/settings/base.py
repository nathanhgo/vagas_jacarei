"""
Django settings — Base configuration.
All environment-specific settings should go in development.py or production.py.
"""

from pathlib import Path

from decouple import Csv, config, AutoConfig
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Busca o .env na raiz do projeto (um nível acima do backend)
config = AutoConfig(search_path=BASE_DIR.parent)

SECRET_KEY = config("DJANGO_SECRET_KEY")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
]

LOCAL_APPS = [
    "core",
    "modules.companies",
    "modules.jobs",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database
db_url = config("DATABASE_URL", default=None)
if db_url:
    DATABASES = {
        "default": dj_database_url.config(default=db_url, conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("POSTGRES_DB"),
            "USER": config("POSTGRES_USER"),
            "PASSWORD": config("POSTGRES_PASSWORD"),
            "HOST": config("POSTGRES_HOST", default="localhost"),
            "PORT": config("POSTGRES_PORT", default="5432"),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# drf-spectacular — OpenAPI 3.0 schema settings
SPECTACULAR_SETTINGS = {
    "TITLE": "Vagas Jacareí API",
    "DESCRIPTION": (
        "API da Plataforma de Vagas de Emprego de Jacareí-SP.\n\n"
        "Projeto de Extensão Universitária."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,  # Não expõe o schema bruto na listagem
    "COMPONENT_SPLIT_REQUEST": True,
    "SORT_OPERATIONS": True,
    "TAGS": [
        {"name": "core", "description": "Endpoints principais e health-check"},
    ],
}

# CORS
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="http://localhost:3000", cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# Media files (uploads)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
