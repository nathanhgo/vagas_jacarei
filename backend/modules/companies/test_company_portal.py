import pytest
from django.urls import reverse
from modules.companies.models import Company
from modules.jobs.models import Job

@pytest.mark.django_db
class TestCompanyPortal:
    """Testes de integração para o Portal da Empresa (Milestone 3)."""

    def test_company_login_success(self, client):
        company = Company.objects.create(
            name="Empresa Portal",
            email="portal@empresa.com",
            cnpj="12.345.678/0001-99"
        )
        url = reverse("companies:company-login")
        payload = {
            "cnpj": "12.345.678/0001-99",
            "email": "portal@empresa.com"
        }
        response = client.post(url, data=payload, content_type="application/json")
        assert response.status_code == 200
        data = response.json()
        assert data["token"] == "12.345.678/0001-99"
        assert data["company"]["name"] == "Empresa Portal"

    def test_company_login_not_found(self, client):
        url = reverse("companies:company-login")
        payload = {
            "cnpj": "00.000.000/0000-00",
            "email": "inexistente@empresa.com"
        }
        response = client.post(url, data=payload, content_type="application/json")
        assert response.status_code == 404

    def test_create_job_authenticated(self, client):
        company = Company.objects.create(
            name="Empresa Portal",
            email="portal@empresa.com",
            cnpj="12.345.678/0001-99",
            is_verified=True
        )
        url = reverse("jobs:job-list")
        payload = {
            "title": "Desenvolvedor Backend Python",
            "description": "Vaga legal de Python.",
            "neighborhood": "Centro",
            "salary": "4500.00"
        }
        # Sem autenticação
        response = client.post(url, data=payload, content_type="application/json")
        assert response.status_code == 401

        # Com autenticação
        headers = {"HTTP_AUTHORIZATION": f"Company {company.cnpj}"}
        response = client.post(url, data=payload, content_type="application/json", **headers)
        assert response.status_code == 201
        
        job = Job.objects.get(title="Desenvolvedor Backend Python")
        assert job.company == company
        assert job.status == "published"

    def test_update_job_permissions(self, client):
        company1 = Company.objects.create(name="Empresa A", email="a@a.com", cnpj="11.111.111/0001-11")
        company2 = Company.objects.create(name="Empresa B", email="b@b.com", cnpj="22.222.222/0001-22")
        
        job = Job.objects.create(company=company1, title="Vaga Original", description="Descrição", is_active=True)
        url = reverse("jobs:job-detail", kwargs={"pk": job.id})
        
        payload = {"title": "Vaga Editada"}
        
        # Sem login
        response = client.put(url, data=payload, content_type="application/json")
        assert response.status_code == 401
        
        # Logado na empresa errada
        headers_b = {"HTTP_AUTHORIZATION": f"Company {company2.cnpj}"}
        response = client.put(url, data=payload, content_type="application/json", **headers_b)
        assert response.status_code == 403
        
        # Logado na empresa dona
        headers_a = {"HTTP_AUTHORIZATION": f"Company {company1.cnpj}"}
        response = client.put(url, data=payload, content_type="application/json", **headers_a)
        assert response.status_code == 200
        
        job.refresh_from_db()
        assert job.title == "Vaga Editada"

    def test_delete_job_logical(self, client):
        company = Company.objects.create(name="Empresa A", email="a@a.com", cnpj="11.111.111/0001-11")
        job = Job.objects.create(company=company, title="Vaga Deletar", description="Descrição", is_active=True)
        url = reverse("jobs:job-detail", kwargs={"pk": job.id})
        
        headers = {"HTTP_AUTHORIZATION": f"Company {company.cnpj}"}
        response = client.delete(url, **headers)
        assert response.status_code == 204
        
        job.refresh_from_db()
        assert not job.is_active
        assert job.status == "deleted"

    def test_list_my_jobs(self, client):
        company1 = Company.objects.create(name="Empresa 1", email="1@1.com", cnpj="11.111.111/0001-11")
        company2 = Company.objects.create(name="Empresa 2", email="2@2.com", cnpj="22.222.222/0001-22")
        
        Job.objects.create(company=company1, title="Vaga 1A", description="D", is_active=True)
        Job.objects.create(company=company1, title="Vaga 1B", description="D", is_active=True)
        Job.objects.create(company=company2, title="Vaga 2A", description="D", is_active=True)
        
        url = reverse("jobs:company-jobs")
        headers = {"HTTP_AUTHORIZATION": f"Company {company1.cnpj}"}
        response = client.get(url, **headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        titles = [item["title"] for item in data]
        assert "Vaga 1A" in titles
        assert "Vaga 1B" in titles
