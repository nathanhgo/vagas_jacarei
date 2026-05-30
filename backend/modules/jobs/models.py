from django.db import models

class Company(models.Model):
    id = models.BigAutoField(primary_key=True)
    
    name = models.CharField(max_length=255, verbose_name="Nome da Empresa")
    phone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone da Empresa")
    email = models.EmailField(max_length=254, verbose_name="E-mail")
    cnpj = models.CharField(max_length=18, unique=True, verbose_name="CNPJ da Empresa")
    address = models.CharField(max_length=255, null=True, blank=True, verbose_name="Endereço")
    complement = models.CharField(max_length=150, null=True, blank=True, verbose_name="Complemento")
    cep = models.CharField(max_length=9, null=True, blank=True, verbose_name="CEP")
    neighborhood = models.CharField(max_length=150, null=True, blank=True, verbose_name="Bairro")
    alternative_email = models.EmailField(max_length=254, null=True, blank=True, verbose_name="E-mail Alternativo")
    description = models.TextField(null=True, blank=True, verbose_name="Descrição, resumo, valores")
    
    is_verified = models.BooleanField(default=False, verbose_name="Homologada pelo PAT")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"

    def __str__(self):
        return self.name

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
        Company,
        on_delete=models.CASCADE,
        related_name="jobs",
        verbose_name="Empresa"
    )
    
    title = models.CharField(max_length=255, verbose_name="Cargo")
    type_of_contract = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        default=ContractType.CLT,
        verbose_name="Tipo de Contrato"
    )
    description = models.TextField(verbose_name="Descrição da Vaga")
    location = models.CharField(max_length=150, default="Jacareí - SP", verbose_name="Localidade")
    neighborhood = models.CharField(max_length=150, null=True, blank=True, verbose_name="Bairro")
    quantity = models.IntegerField(default=1, null=True, blank=True, verbose_name="Quantidade de Vagas")
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Salário")
    
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.EVALUATION,
        verbose_name="Status da Vaga"
    )
    
    external_link = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link Externo")
    ref_email = models.EmailField(max_length=254, null=True, blank=True, verbose_name="E-mail de Referência")
    
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")

    class Meta:
        verbose_name = "Vaga"
        verbose_name_plural = "Vagas"

    def __str__(self):
        return f"{self.title} - {self.company.name}"