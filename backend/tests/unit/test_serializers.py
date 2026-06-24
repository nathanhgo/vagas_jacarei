import pytest
from modules.companies.models import Company
from modules.companies.serializers import CompanySerializer
from modules.jobs.models import Job, Candidacy
from modules.jobs.serializers import JobSerializer, CandidacySerializer

@pytest.mark.django_db
class TestCompanySerializer:
    def test_company_serializer_valid_data(self):
        """Testa a validação de um serializer com dados perfeitos."""
        data = {
            "name": "Tech Corp",
            "email": "hr@tech.com",
            "cnpj": "12.345.678/0001-99",
            "password": "strongpassword123",
            "phone": "(11) 91234-5678",
            "cep": "12345-678"
        }
        serializer = CompanySerializer(data=data)
        assert serializer.is_valid() is True

    @pytest.mark.parametrize("invalid_cnpj", [
        "123", "abc", "12.345.678/0001", ""
    ])
    def test_company_serializer_invalid_cnpj(self, invalid_cnpj):
        """Testa o validator regex do CNPJ (Valor Limite / Equivalência)."""
        data = {
            "name": "Tech Corp",
            "email": "hr@tech.com",
            "cnpj": invalid_cnpj,
            "password": "strongpassword123"
        }
        serializer = CompanySerializer(data=data)
        assert serializer.is_valid() is False
        assert "cnpj" in serializer.errors

    @pytest.mark.parametrize("invalid_phone", [
        "123", "abc", "(1) 9999-9999"
    ])
    def test_company_serializer_invalid_phone(self, invalid_phone):
        """Testa o validator regex do telefone."""
        data = {
            "name": "Tech Corp",
            "email": "hr@tech.com",
            "cnpj": "12.345.678/0001-99",
            "password": "strongpassword123",
            "phone": invalid_phone
        }
        serializer = CompanySerializer(data=data)
        assert serializer.is_valid() is False
        assert "phone" in serializer.errors

    def test_company_serializer_create(self):
        """Testa o fluxo de criação customizado (hash de senha)."""
        data = {
            "name": "Tech Corp",
            "email": "hr@tech.com",
            "cnpj": "12.345.678/0001-99",
            "password": "strongpassword123"
        }
        serializer = CompanySerializer(data=data)
        assert serializer.is_valid() is True
        company = serializer.save()
        assert company.name == "Tech Corp"
        # Garante que a senha foi hasheada
        assert company.password != "strongpassword123"
        assert company.check_password("strongpassword123") is True

    def test_company_serializer_update(self):
        """Testa o fluxo de atualização customizado."""
        company = Company.objects.create(name="Old Name", email="a@a.com", cnpj="00.000.000/0000-00")
        company.set_password("oldpassword")
        company.save()

        data = {"name": "New Name", "password": "newpassword123"}
        serializer = CompanySerializer(instance=company, data=data, partial=True)
        assert serializer.is_valid() is True
        updated_company = serializer.save()

        assert updated_company.name == "New Name"
        assert updated_company.check_password("newpassword123") is True


@pytest.mark.django_db
class TestJobSerializer:
    def test_job_serializer_candidacies_count(self):
        """Testa a propriedade calculada (SerializerMethodField)."""
        company = Company.objects.create(name="Company", email="a@a.com", cnpj="00.000.000/0000-00")
        job = Job.objects.create(company=company, title="Dev Python", description="Vaga")
        
        # Cria candidaturas
        Candidacy.objects.create(job=job, full_name="A", email="a@test.com", phone="11999999999")
        Candidacy.objects.create(job=job, full_name="B", email="b@test.com", phone="11999999999")

        serializer = JobSerializer(instance=job)
        assert serializer.data["candidacies_count"] == 2
        assert serializer.data["company"] == "Company"

@pytest.mark.django_db
class TestCandidacySerializer:
    def test_candidacy_serializer_read_only_fields(self):
        company = Company.objects.create(name="Company", email="a@a.com", cnpj="00.000.000/0000-00")
        job = Job.objects.create(company=company, title="Dev Python", description="Vaga")
        
        candidacy = Candidacy.objects.create(job=job, full_name="A", email="a@test.com", phone="11999999999")
        serializer = CandidacySerializer(instance=candidacy)
        
        assert serializer.data["full_name"] == "A"
        assert "created_at" in serializer.data
