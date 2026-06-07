from rest_framework import serializers
from .models import Job, Candidacy

class JobSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

class CandidacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidacy
        fields = ["id", "job", "full_name", "email", "phone", "resume", "created_at"]
        read_only_fields = ["job", "created_at"]
