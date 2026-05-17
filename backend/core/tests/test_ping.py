"""Tests for core app views."""

import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestPingEndpoint:
    """Test suite for the /api/ping/ health-check endpoint."""

    def test_ping_returns_200(self, client):
        """Endpoint must return HTTP 200 OK."""
        url = reverse("core:ping")
        response = client.get(url)
        assert response.status_code == 200

    def test_ping_returns_pong_message(self, client):
        """Payload must contain message='pong'."""
        url = reverse("core:ping")
        response = client.get(url)
        data = response.json()
        assert data["message"] == "pong"

    def test_ping_returns_ok_status(self, client):
        """Payload must contain status='ok'."""
        url = reverse("core:ping")
        response = client.get(url)
        data = response.json()
        assert data["status"] == "ok"

    def test_ping_returns_django_version(self, client):
        """Payload must include django_version field."""
        url = reverse("core:ping")
        response = client.get(url)
        data = response.json()
        assert "django_version" in data
        assert data["django_version"]  # non-empty

    def test_ping_content_type_is_json(self, client):
        """Response Content-Type must be application/json."""
        url = reverse("core:ping")
        response = client.get(url)
        assert "application/json" in response["Content-Type"]

    def test_ping_does_not_accept_post(self, client):
        """Endpoint must reject POST requests with 405 Method Not Allowed."""
        url = reverse("core:ping")
        response = client.post(url)
        assert response.status_code == 405
