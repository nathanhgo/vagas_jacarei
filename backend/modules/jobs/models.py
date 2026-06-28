from django.core.validators import FileExtensionValidator
from django.db import models


class Job(models.Model):
    class ContractType(models.TextChoices):
        CLT = "CLT", "CLT"
        PJ = "PJ", "PJ"
        FREELANCE = "FREELANCE", "Freelance"
        INTERNSHIP = "INTERNSHIP", "Estágio"
        TEMPORARY = "TEMPORARY", "Temporário"

    class JobStatus(models.TextChoices):
        PUBLISHED = "published", "Publicado"
        FINALIZED = "finalized", "Finalizado"
        ARCHIVED = "archived", "Arquivado"
        DELETED = "deleted", "Deletado"
        EVALUATION = "evaluation", "Em Avaliação"

    id = models.BigAutoField(primary_key=True)

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="jobs",
        verbose_name="Empresa",
    )

    title = models.CharField(max_length=255, verbose_name="Cargo")
    type_of_contract = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        default=ContractType.CLT,
        verbose_name="Tipo de Contrato",
    )
    description = models.TextField(verbose_name="Descrição da Vaga")
    location = models.CharField(
        max_length=150, default="Jacareí - SP", verbose_name="Localidade"
    )
    neighborhood = models.CharField(
        max_length=150, null=True, blank=True, verbose_name="Bairro"
    )
    quantity = models.IntegerField(
        default=1, null=True, blank=True, verbose_name="Quantidade de Vagas"
    )
    salary = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Salário"
    )

    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.EVALUATION,
        verbose_name="Status da Vaga",
    )

    external_link = models.URLField(
        max_length=500, null=True, blank=True, verbose_name="Link Externo"
    )
    ref_email = models.EmailField(
        max_length=254, null=True, blank=True, verbose_name="E-mail de Referência"
    )
    views_count = models.IntegerField(default=0, verbose_name="Visualizações")
    clicks_count = models.IntegerField(default=0, verbose_name="Cliques")

    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")

    class Meta:
        verbose_name = "Vaga"
        verbose_name_plural = "Vagas"
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(type_of_contract="CLT") | models.Q(salary__gte=1412.00),
                name="clt_salary_min_wage"
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name="job_quantity_min_one"
            ),
        ]

    def __str__(self):
        return f"{self.title} - {self.company.name}"


class Candidacy(models.Model):
    id = models.BigAutoField(primary_key=True)
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="candidacies", verbose_name="Vaga"
    )
    full_name = models.CharField(max_length=255, verbose_name="Nome Completo")
    email = models.EmailField(verbose_name="E-mail")
    phone = models.CharField(max_length=20, verbose_name="Telefone")
    resume = models.FileField(
        upload_to="resumes/%Y/%m/%d/",
        validators=[FileExtensionValidator(allowed_extensions=["pdf", "doc", "docx"])],
        verbose_name="Currículo",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Candidatado em")

    class Meta:
        verbose_name = "Candidatura"
        verbose_name_plural = "Candidaturas"

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"
