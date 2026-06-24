import pytest
from decimal import Decimal
from modules.companies.models import Company
from modules.jobs.models import Job
from modules.jobs.services import JobService

@pytest.mark.django_db
class TestJobService:
    """
    Suíte de testes unitários que aplica as técnicas exigidas.
    """

    @pytest.fixture
    def company(self):
        return Company.objects.create(
            name="Empresa Teste", email="teste@empresa.com", cnpj="00.000.000/0000-00"
        )

    
    # TÉCNICA FUNCIONAL: CLASSES DE EQUIVALÊNCIA
    def test_equivalence_classes_salary(self, company):
        """
        Testa o grupo de entradas VÁLIDAS (>= 1412) e INVÁLIDAS (< 1412) para salário CLT.
        """
        # Classe Inválida
        job_invalid = Job(
            company=company, title="Dev", description="Vaga",
            type_of_contract=Job.ContractType.CLT, salary=Decimal('1000.00')
        )
        assert JobService.can_be_published(job_invalid) is False

        # Classe Válida
        job_valid = Job(
            company=company, title="Dev", description="Vaga",
            type_of_contract=Job.ContractType.CLT, salary=Decimal('2000.00')
        )
        assert JobService.can_be_published(job_valid) is True

    
    # TÉCNICA FUNCIONAL: VALOR LIMITE
    @pytest.mark.parametrize("salary_val, expected", [
        (Decimal('1411.99'), False), # Abaixo do limite exato
        (Decimal('1412.00'), True),  # No limite exato
        (Decimal('1412.01'), True),  # Acima do limite exato
    ])
    def test_boundary_value_salary(self, company, salary_val, expected):
        """
        Testa as fronteiras exatas (Valor Limite) do salário mínimo para CLT.
        """
        job = Job(
            company=company, title="Dev", description="Vaga",
            type_of_contract=Job.ContractType.CLT, salary=salary_val
        )
        assert JobService.can_be_published(job) is expected

    @pytest.mark.parametrize("quantity_val, expected", [
        (0, False), # Limite inferior inválido
        (1, True),  # Limite exato válido
        (2, True),  # Limite superior válido
    ])
    def test_boundary_value_quantity(self, company, quantity_val, expected):
        """
        Testa as fronteiras exatas da quantidade de vagas.
        """
        job = Job(
            company=company, title="Dev", description="Vaga",
            type_of_contract=Job.ContractType.PJ, salary=Decimal('0.00'),
            quantity=quantity_val
        )
        assert JobService.can_be_published(job) is expected

    
    # TÉCNICA ESTRUTURAL: TESTE DE CAMINHOS
    def test_path_testing_can_be_published(self, company):
        """
        Garante que todos os caminhos do if/else de can_be_published sejam executados.
        """
        # Caminho 1: Sem título (retorna rápido)
        job1 = Job(company=company, title="", description="Vaga")
        assert JobService.can_be_published(job1) is False

        # Caminho 2: CLT com salário nulo
        job2 = Job(company=company, title="Dev", description="Vaga", type_of_contract=Job.ContractType.CLT, salary=None)
        assert JobService.can_be_published(job2) is False

        # Caminho 3: Vaga válida, mas quantidade < 1
        job3 = Job(company=company, title="Dev", description="Vaga", type_of_contract=Job.ContractType.PJ, quantity=0)
        assert JobService.can_be_published(job3) is False

        # Caminho 4: Tudo certo (Caminho feliz)
        job4 = Job(company=company, title="Dev", description="Vaga", type_of_contract=Job.ContractType.PJ, quantity=1)
        assert JobService.can_be_published(job4) is True

    
    # TÉCNICA ESTRUTURAL: FLUXO DE DADOS
    def test_data_flow_publish_job(self, company):
        """
        Testa o fluxo e as mutações da variável `status` do objeto Job.
        """
        # Criação (variável instanciada como EVALUATION)
        job = Job.objects.create(
            company=company, title="Dev", description="Vaga",
            type_of_contract=Job.ContractType.CLT, salary=Decimal('3000.00'),
            status=Job.JobStatus.EVALUATION
        )
        assert job.status == Job.JobStatus.EVALUATION
        
        # Chamada do serviço (Mutação interna do dado se for válido)
        success = JobService.publish_job(job)
        
        # Recuperação do banco para verificar a estabilidade do fluxo de dado
        job.refresh_from_db()
        assert success is True
        assert job.status == Job.JobStatus.PUBLISHED

    def test_can_candidate_apply_extensions(self, company):
        """
        Testa as classes de equivalência para extensão de arquivo.
        """
        job = Job.objects.create(
            company=company, title="Dev", description="Vaga",
            status=Job.JobStatus.PUBLISHED, is_active=True
        )
        
        # Extensões válidas
        assert JobService.can_candidate_apply(job, "curriculo.pdf") is True
        assert JobService.can_candidate_apply(job, "curriculo.doc") is True
        assert JobService.can_candidate_apply(job, "curriculo.docx") is True
        
        # Extensões inválidas
        assert JobService.can_candidate_apply(job, "curriculo.exe") is False
        assert JobService.can_candidate_apply(job, "curriculo.png") is False
        assert JobService.can_candidate_apply(job, "") is False

    def test_can_candidate_apply_status(self, company):
        """
        Caminhos relacionados ao status da vaga.
        """
        job_eval = Job.objects.create(
            company=company, title="Dev", description="Vaga",
            status=Job.JobStatus.EVALUATION, is_active=True
        )
        assert JobService.can_candidate_apply(job_eval, "curriculo.pdf") is False

        job_inactive = Job.objects.create(
            company=company, title="Dev", description="Vaga",
            status=Job.JobStatus.PUBLISHED, is_active=False
        )
        assert JobService.can_candidate_apply(job_inactive, "curriculo.pdf") is False

    def test_data_flow_archive_job(self, company):
        """
        Fluxo de dados da mutação de arquivar uma vaga.
        """
        job = Job.objects.create(
            company=company, title="Dev", description="Vaga",
            status=Job.JobStatus.PUBLISHED, is_active=True
        )
        assert job.status == Job.JobStatus.PUBLISHED
        assert job.is_active is True
        
        success = JobService.archive_job(job)
        job.refresh_from_db()
        
        assert success is True
        assert job.status == Job.JobStatus.ARCHIVED
        assert job.is_active is False
        
        # Arquivar algo já arquivado
        assert JobService.archive_job(job) is False

