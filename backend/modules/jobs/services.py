from decimal import Decimal
from modules.jobs.models import Job

class JobService:
    @staticmethod
    def can_be_published(job: Job) -> bool:
        """
        Valida se uma vaga atende a todos os requisitos para ser publicada.
        Isso nos permite ter caminhos estruturais para testar (Path Testing).
        """
        # Caminho 1: Título ou descrição em branco
        if not job.title or not job.description:
            return False
            
        # Caminho 2: Validação de salário para CLT
        if job.type_of_contract == Job.ContractType.CLT:
            # Salário mínimo atual como exemplo
            if job.salary is None or job.salary < Decimal('1412.00'):
                return False
        
        # Caminho 3: Quantidade de vagas não pode ser menor que 1
        if job.quantity is not None and job.quantity < 1:
            return False
            
        # Caminho 4: Tudo certo
        return True

    @staticmethod
    def publish_job(job: Job) -> bool:
        """
        Muda o status da vaga se ela puder ser publicada.
        Isso nos permite testar o fluxo de dados (Data Flow).
        """
        if JobService.can_be_published(job):
            job.status = Job.JobStatus.PUBLISHED
            job.save()
            return True
        return False

    @staticmethod
    def can_candidate_apply(job: Job, resume_name: str) -> bool:
        """
        Valida se um candidato pode se aplicar à vaga.
        """
        # Caminho 1: Vaga inativa ou não publicada
        if not job.is_active or job.status != Job.JobStatus.PUBLISHED:
            return False
            
        # Caminho 2: Validação da extensão do currículo
        if not resume_name:
            return False
            
        allowed_extensions = ['.pdf', '.doc', '.docx']
        if not any(resume_name.lower().endswith(ext) for ext in allowed_extensions):
            return False
            
        return True

    @staticmethod
    def archive_job(job: Job) -> bool:
        """
        Arquiva a vaga, impedindo novas candidaturas.
        """
        if job.status == Job.JobStatus.ARCHIVED:
            return False
        job.status = Job.JobStatus.ARCHIVED
        job.is_active = False
        job.save()
        return True

