import pytest
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from modules.companies.models import Company
from modules.jobs.models import Candidacy, Job


@pytest.mark.django_db
class TestJobDetailAPIView:
    """Testes de integração para detalhe de vaga local."""

    def test_get_local_job_details(self, client):
        company = Company.objects.create(
            name="Empresa de Teste", email="hr@test.com", cnpj="00.000.000/0001-00"
        )
        job = Job.objects.create(
            company=company,
            title="Desenvolvedor Django",
            description="Vaga para desenvolvedor backend.",
            location="Jacareí - SP",
            ref_email="rh_ref@test.com",
            is_active=True,
        )
        url = reverse("jobs:job-detail", kwargs={"pk": job.id})
        response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Desenvolvedor Django"
        assert data["company"] == "Empresa de Teste"
        assert data["source"] == "local"


@pytest.mark.django_db
class TestJobCandidacyAPIView:
    """Testes de integração para candidatura rápida."""

    def test_apply_to_local_job_success(self, client):
        # Limpa fila de e-mails de teste
        mail.outbox = []

        company = Company.objects.create(
            name="Empresa de Teste", email="hr@test.com", cnpj="00.000.000/0001-00"
        )
        job = Job.objects.create(
            company=company,
            title="Desenvolvedor Django",
            description="Vaga para desenvolvedor backend.",
            location="Jacareí - SP",
            ref_email="rh_ref@test.com",
            is_active=True,
        )

        resume_file = SimpleUploadedFile(
            "resume.pdf", b"pdf content", content_type="application/pdf"
        )

        url = reverse("jobs:job-apply", kwargs={"pk": job.id})
        payload = {
            "full_name": "João da Silva",
            "email": "joao@candidato.com",
            "phone": "(12) 99999-9999",
            "resume": resume_file,
        }

        response = client.post(url, data=payload, format="multipart")
        assert response.status_code == 201

        assert Candidacy.objects.filter(email="joao@candidato.com").exists()

        assert len(mail.outbox) == 1
        sent_mail = mail.outbox[0]
        assert sent_mail.to == ["rh_ref@test.com"]
        assert "João da Silva" in sent_mail.body
        assert len(sent_mail.attachments) == 1
        assert sent_mail.attachments[0][0].startswith("resume")
        assert sent_mail.attachments[0][0].endswith(".pdf")

    def test_apply_to_local_job_invalid_file_extension(self, client):
        company = Company.objects.create(
            name="Empresa de Teste", email="hr@test.com", cnpj="00.000.000/0001-00"
        )
        job = Job.objects.create(
            company=company,
            title="Desenvolvedor Django",
            description="Vaga para desenvolvedor backend.",
            location="Jacareí - SP",
            is_active=True,
        )

        resume_file = SimpleUploadedFile(
            "script.exe", b"malicious content", content_type="application/octet-stream"
        )

        url = reverse("jobs:job-apply", kwargs={"pk": job.id})
        payload = {
            "full_name": "João da Silva",
            "email": "joao@candidato.com",
            "phone": "(12) 99999-9999",
            "resume": resume_file,
        }

        response = client.post(url, data=payload, format="multipart")
        assert response.status_code == 400
        assert "resume" in response.json()
