from django.core.validators import RegexValidator
from rest_framework import serializers

from .models import Company

phone_validator = RegexValidator(
    regex=r"^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$",
    message="Telefone inválido. Use (11) 91234-5678 ou 11912345678.",
)
cep_validator = RegexValidator(
    regex=r"^\d{5}-?\d{3}$", message="CEP inválido. Use 12345-678 ou 12345678."
)
cnpj_validator = RegexValidator(
    regex=r"^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$",
    message="CNPJ inválido. Use 00.000.000/0000-00 ou 00000000000000.",
)


class CompanySerializer(serializers.ModelSerializer):
    phone = serializers.CharField(
        required=False, allow_blank=True, validators=[phone_validator]
    )
    cep = serializers.CharField(
        required=False, allow_blank=True, validators=[cep_validator]
    )
    cnpj = serializers.CharField(validators=[cnpj_validator])
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ["id", "is_verified", "created_at"]

    def create(self, validated_data):
        raw_password = validated_data.pop("password")
        company = Company(**validated_data)
        company.set_password(raw_password)
        company.save()
        return company

    def update(self, instance, validated_data):
        raw_password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if raw_password:
            instance.set_password(raw_password)
        instance.save()
        return instance
