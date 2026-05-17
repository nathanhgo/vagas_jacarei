"""Development-specific Django settings."""

from .base import *  # noqa: F401, F403

# In development, allow all origins for DRF browsable API
CORS_ALLOW_ALL_ORIGINS = True

# Show detailed error pages
DEBUG = True

# Django Debug Toolbar can be added here when needed
INTERNAL_IPS = ["127.0.0.1"]
