from django.test import TestCase
from modules.companies.models import Company
from modules.jobs.models import Job

class JobServiceUnittest(TestCase):
    """
    Testes de Unidade utilizando a ferramenta padrão do Python/Django (unittest).
    Atende ao requisito: 'Usar 2 ferramentas de Teste de Unidade'.
    """

    def setUp(self):
        """Método de setup padrão do unittest."""
        self.company = Company.objects.create(
            name="Unittest Corp",
            email="unit@test.com",
            cnpj="11.111.111/1111-11"
        )
        self.job = Job.objects.create(
            company=self.company,
            title="Desenvolvedor Python",
            description="Vaga para testes com unittest",
            is_active=True
        )

    def test_job_creation_with_unittest(self):
        """Verifica as propriedades básicas de criação."""
        self.assertEqual(self.job.title, "Desenvolvedor Python")
        self.assertTrue(self.job.is_active)
        self.assertEqual(self.job.company.name, "Unittest Corp")

    def test_company_string_representation(self):
        """Verifica a representação de string da empresa."""
        self.assertEqual(str(self.company), "Unittest Corp")

    def test_job_default_contract_type(self):
        """Verifica se o contrato default é CLT usando os asserts do unittest."""
        self.assertEqual(self.job.type_of_contract, Job.ContractType.CLT)
