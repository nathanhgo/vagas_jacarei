from rest_framework import serializers

from .models import Candidacy, Job


class JobSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="company.name", read_only=True)
    candidacies_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = "__all__"

    def get_candidacies_count(self, obj):
        return obj.candidacies.count()


class CandidacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidacy
        fields = ["id", "job", "full_name", "email", "phone", "resume", "created_at"]
        read_only_fields = ["job", "created_at"]
