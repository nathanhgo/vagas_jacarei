import pytest
from decimal import Decimal
from django.db.utils import IntegrityError
from modules.companies.models import Company
from modules.jobs.models import Job

@pytest.mark.django_db
class TestJobDatabaseConstraints:

    @pytest.fixture
    def company(self):
        return Company.objects.create(
            name="Empresa Teste DB",
            email="testedb@empresa.com",
            cnpj="11.111.111/0001-11"
        )

    def test_db_constraint_clt_salary_min_wage(self, company):
        invalid_job = Job(
            company=company,
            title="Dev Django",
            description="Requisitos",
            type_of_contract=Job.ContractType.CLT,
            salary=Decimal("1000.00"),
            quantity=1
        )
        with pytest.raises(IntegrityError):
            invalid_job.save()

    def test_db_constraint_quantity_min_one(self, company):
        invalid_job = Job(
            company=company,
            title="Dev Python",
            description="Requisitos",
            type_of_contract=Job.ContractType.PJ,
            salary=Decimal("0.00"),
            quantity=0
        )
        with pytest.raises(IntegrityError):
            invalid_job.save()

    def test_db_constraints_valid_clt_job(self, company):
        valid_job = Job(
            company=company,
            title="Dev Python",
            description="Requisitos",
            type_of_contract=Job.ContractType.CLT,
            salary=Decimal("1500.00"),
            quantity=2
        )
        valid_job.save()
        assert Job.objects.filter(id=valid_job.id).exists()
