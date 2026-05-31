from django.db import models

# Create your models here.
class Company(models.Model):
    id = models.BigAutoField(primary_key=True)
    
    name = models.CharField(max_length=255, verbose_name="Nome da Empresa")
    phone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone da Empresa")
    email = models.EmailField(max_length=254, verbose_name="E-mail")
    cnpj = models.CharField(max_length=18, unique=True, verbose_name="CNPJ da Empresa")
    address = models.CharField(max_length=255, null=True, blank=True, verbose_name="Endereço")
    number = models.CharField(max_length=20, null=True, blank=True, verbose_name="Número")
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