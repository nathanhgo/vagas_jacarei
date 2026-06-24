import pytest
from decimal import Decimal
from modules.companies.models import Company
from modules.jobs.models import Job, Candidacy

@pytest.mark.django_db
class TestCompanyModel:
    def test_company_creation(self):
        company = Company.objects.create(name="Tech Corp", email="hr@tech.com", cnpj="12.345.678/0001-99")
        assert company.name == "Tech Corp"
        assert company.is_verified is False  # default value
        
    def test_company_str_representation(self):
        company = Company.objects.create(name="Tech Corp", email="hr@tech.com", cnpj="12.345.678/0001-99")
        assert str(company) == "Tech Corp"

@pytest.mark.django_db
class TestJobModel:
    @pytest.fixture
    def company(self):
        return Company.objects.create(name="Company", email="a@a.com", cnpj="00.000.000/0000-00")

    def test_job_default_values(self, company):
        job = Job.objects.create(company=company, title="Dev", description="Vaga")
        assert job.type_of_contract == Job.ContractType.CLT
        assert job.status == Job.JobStatus.EVALUATION
        assert job.location == "Jacareí - SP"
        assert job.is_active is True
        assert job.views_count == 0
        assert job.clicks_count == 0

    def test_job_str_representation(self, company):
        job = Job.objects.create(company=company, title="Dev Python", description="Vaga")
        assert str(job) == "Dev Python - Company"

    @pytest.mark.parametrize("status, expected", [
        (Job.JobStatus.PUBLISHED, "published"),
        (Job.JobStatus.FINALIZED, "finalized"),
        (Job.JobStatus.ARCHIVED, "archived"),
        (Job.JobStatus.DELETED, "deleted"),
        (Job.JobStatus.EVALUATION, "evaluation"),
    ])
    def test_job_status_choices(self, company, status, expected):
        job = Job.objects.create(company=company, title="Dev", description="Vaga", status=status)
        assert job.status == expected

@pytest.mark.django_db
class TestCandidacyModel:
    @pytest.fixture
    def job(self):
        company = Company.objects.create(name="Company", email="a@a.com", cnpj="00.000.000/0000-00")
        return Job.objects.create(company=company, title="Dev Python", description="Vaga")

    def test_candidacy_creation(self, job):
        candidacy = Candidacy.objects.create(
            job=job, full_name="João Silva", email="joao@teste.com", phone="12999999999"
        )
        assert candidacy.full_name == "João Silva"
        assert candidacy.email == "joao@teste.com"

    def test_candidacy_str_representation(self, job):
        candidacy = Candidacy.objects.create(
            job=job, full_name="João Silva", email="joao@teste.com", phone="12999999999"
        )
        assert str(candidacy) == "João Silva - Dev Python"
