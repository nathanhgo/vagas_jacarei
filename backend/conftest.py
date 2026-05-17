"""
pytest configuration file.
Defines fixtures shared across all tests.
"""

import pytest


@pytest.fixture
def api_client():
    """DRF APIClient fixture for testing API endpoints directly."""
    from rest_framework.test import APIClient

    return APIClient()
