import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock
from rest_framework import status
from django.urls import reverse
from modules.companies.models import Company
from modules.jobs.models import Job

@pytest.mark.django_db
class TestBackendViews:

    @pytest.fixture
    def company(self):
        c = Company.objects.create(
            name="Empresa Jacarei Test",
            email="contato@jacareitest.com",
            cnpj="12.345.678/0001-00",
            phone="12345678"
        )
        c.set_password("senha123")
        c.save()
        return c

    @pytest.fixture
    def job(self, company):
        return Job.objects.create(
            company=company,
            title="Dev Back-end",
            description="Requisitos de teste",
            type_of_contract=Job.ContractType.PJ,
            salary=Decimal("5000.00"),
            quantity=1,
            status=Job.JobStatus.PUBLISHED
        )

    def test_list_companies(self, api_client, company):
        url = reverse("companies:company-list")
        response = api_client.get(url, {"page": 1, "page_size": 5})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1
        assert response.data["results"][0]["name"] == company.name

    def test_create_company_success(self, api_client):
        url = reverse("companies:company-list")
        data = {
            "name": "Nova Empresa de Tecnologia",
            "email": "nova@empresa.com",
            "cnpj": "99.888.777/0001-99",
            "password": "novasenha123"
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["cnpj"] == "99.888.777/0001-99"

    def test_create_company_failure(self, api_client):
        url = reverse("companies:company-list")
        data = {
            "name": "",
            "cnpj": "99.888.777/0001-99"
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_company_detail_and_update(self, api_client, company):
        url = reverse("companies:company-detail", kwargs={"pk": company.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == company.name

        update_data = {"name": "Nome Alterado"}
        response = api_client.put(url, update_data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Nome Alterado"

        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Company.objects.filter(pk=company.pk).exists()

    def test_company_login_flow(self, api_client, company):
        url = reverse("companies:company-login")
        
        data = {
            "cnpj": company.cnpj,
            "email": company.email,
            "password": "senha123"
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "token" in response.data
        assert response.data["company"]["cnpj"] == company.cnpj

        data["password"] = "senha_errada"
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        data["cnpj"] = "00.000.000/0001-00"
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND

        response = api_client.post(url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_company_google_auth(self, api_client, company):
        url = reverse("companies:company-google-auth")
        
        response = api_client.post(url, {"email": company.email}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "token" in response.data

        response = api_client.post(url, {"email": "novo@google.com"}, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["need_registration"] is True

        response = api_client.post(url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("requests.get")
    def test_job_list_endpoints(self, mock_get, api_client, job):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"count": 0, "results": []}
        mock_get.return_value = mock_response

        url = reverse("jobs:job-list")
        
        response = api_client.get(url, {"page": 1, "page_size": 6})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

        response = api_client.post(url, {"title": "Nova Vaga"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        api_client.credentials(HTTP_AUTHORIZATION=f"Company {job.company.cnpj}")
        data = {
            "title": "Vaga CLT Válida",
            "description": "Uma vaga de teste CLT.",
            "type_of_contract": "CLT",
            "salary": 1500.00,
            "quantity": 2
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Vaga CLT Válida"

    def test_company_own_jobs_list(self, api_client, job):
        url = reverse("jobs:company-jobs")

        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        api_client.credentials(HTTP_AUTHORIZATION=f"Company {job.company.cnpj}")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]["title"] == job.title

    def test_job_detail_update_delete(self, api_client, job):
        url = reverse("jobs:job-detail", kwargs={"pk": job.pk})

        views_before = job.views_count
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == job.title
        job.refresh_from_db()
        assert job.views_count == views_before + 1

        response = api_client.put(url, {"title": "Update"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        other_company = Company.objects.create(
            name="Outra Empresa", cnpj="99.999.999/0001-99", email="outra@empresa.com"
        )
        api_client.credentials(HTTP_AUTHORIZATION=f"Company {other_company.cnpj}")
        response = api_client.put(url, {"title": "Update"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

        api_client.credentials(HTTP_AUTHORIZATION=f"Company {job.company.cnpj}")
        response = api_client.put(url, {"title": "Título Alterado"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Título Alterado"

        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        job.refresh_from_db()
        assert job.is_active is False
        assert job.status == "deleted"
