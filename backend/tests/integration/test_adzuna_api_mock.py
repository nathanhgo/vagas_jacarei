import pytest
from unittest.mock import patch, MagicMock
from rest_framework import status
from django.urls import reverse

@pytest.mark.django_db
class TestAdzunaAPIMock:

    @patch("requests.get")
    def test_fetch_jobs_with_adzuna_mock(self, mock_get, api_client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "count": 1,
            "results": [
                {
                    "id": "123456",
                    "title": "Desenvolvedor Python Teste Adzuna",
                    "company": {"display_name": "Empresa Mockada Adzuna"},
                    "description": "Vaga mockada para testes de integração.",
                    "redirect_url": "https://adzuna.com/vaga-123456",
                    "salary_min": 5000.00,
                    "created": "2026-06-24T00:00:00Z"
                }
            ]
        }
        mock_get.return_value = mock_response

        url = reverse("jobs:job-list")
        response = api_client.get(url, {"page": 1, "page_size": 6, "search": "Python"})

        assert mock_get.called
        assert response.status_code == status.HTTP_200_OK
        
        results = response.data.get("results", [])
        assert any(job["title"] == "Desenvolvedor Python Teste Adzuna" for job in results)
        assert any(job["source"] == "external" for job in results)
