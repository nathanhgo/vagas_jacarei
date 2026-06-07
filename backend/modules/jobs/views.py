from decouple import config
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


def extract_neighborhood(text):
    """Helper para extrair bairros conhecidos de Jacareí a partir do texto descritivo"""
    if not text:
        return None

    bairros = [
        "Centro",
        "Villa Branca",
        "Jardim das Indústrias",
        "Jardim Santa Maria",
        "Parque Califórnia",
        "Parque dos Sinos",
        "Jardim Paraíba",
        "Jardim Flórida",
        "Igarapés",
        "Jardim Coleginho",
        "Cidade Salvador",
        "Balneário Paraíba",
        "São João",
        "Jardim America",
    ]
    text_lower = text.lower()
    for bairro in bairros:
        if bairro.lower() in text_lower:
            return bairro
    return None


def _format_job_item(item):
    """Helper para formatar o payload de vaga da Adzuna."""
    try:
        job_id = int(item.get("id"))
    except (ValueError, TypeError):
        return None

    title = item.get("title", "")
    company = item.get("company", {}).get("display_name", "Empresa Não Informada")
    description = item.get("description", "")
    external_link = item.get("redirect_url", "")
    salary = item.get("salary_min", None)
    if salary is not None:
        try:
            salary = float(salary) / 12
        except (ValueError, TypeError):
            salary = None
    created_at = item.get("created", "")

    extracted_text = f"{title} {description}"
    neighborhood = extract_neighborhood(extracted_text)

    desc_lower = (title + " " + description).lower()
    if (
        "estágio" in desc_lower
        or "estagiário" in desc_lower
        or "estagiária" in desc_lower
    ):
        type_of_contract = "INTERNSHIP"
    elif "pj" in desc_lower or "pessoa jurídica" in desc_lower:
        type_of_contract = "PJ"
    elif "freelance" in desc_lower or "freelancer" in desc_lower:
        type_of_contract = "FREELANCE"
    elif (
        "temporário" in desc_lower
        or "temporária" in desc_lower
        or item.get("contract_type") == "contract"
    ):
        type_of_contract = "TEMPORARY"
    else:
        type_of_contract = "CLT"

    return {
        "id": job_id,
        "title": title,
        "company": company,
        "type_of_contract": type_of_contract,
        "description": description,
        "location": "Jacareí - SP",
        "neighborhood": neighborhood,
        "quantity": 1,
        "salary": salary,
        "status": "published",
        "external_link": external_link,
        "ref_email": None,
        "is_active": True,
        "created_at": created_at,
        "updated_at": created_at,
    }


def get_authenticated_company(request):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Company "):
        cnpj = auth_header.split(" ")[1]
        from modules.companies.models import Company

        return Company.objects.filter(cnpj=cnpj).first()
    return None


class JobListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        from django.db.models import Q

        from .models import Job
        from .serializers import JobSerializer

        page = request.query_params.get("page", 1)
        try:
            page = int(page)
            if page < 1:
                page = 1
        except ValueError:
            page = 1

        page_size = request.query_params.get("page_size", 6)
        try:
            page_size = int(page_size)
            if page_size < 1:
                page_size = 6
        except ValueError:
            page_size = 6

        search_query = request.query_params.get("search", "")

        # Filtra apenas vagas locais ativas (desativamos busca externa)
        queryset = Job.objects.filter(is_active=True).order_by("-created_at")

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
                | Q(company__name__icontains=search_query)
                | Q(neighborhood__icontains=search_query)
            )

        count = queryset.count()
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        results = queryset[start_idx:end_idx]
        serializer = JobSerializer(results, many=True)

        next_page = None
        if page * page_size < count:
            next_page = f"/api/jobs/?page={page + 1}&page_size={page_size}"
            if search_query:
                next_page += f"&search={search_query}"

        prev_page = None
        if page > 1:
            prev_page = f"/api/jobs/?page={page - 1}&page_size={page_size}"
            if search_query:
                prev_page += f"&search={search_query}"

        return Response(
            {
                "count": count,
                "next": next_page,
                "previous": prev_page,
                "results": serializer.data,
            }
        )

    def post(self, request, *args, **kwargs):
        company = get_authenticated_company(request)
        if not company:
            return Response(
                {"detail": "Não autorizado. Faça login como empresa."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from .serializers import JobSerializer

        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            status_vaga = "published"
            serializer.save(company=company, status=status_vaga)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailAPIView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            job_id = int(pk)
        except (ValueError, TypeError):
            return Response(
                {"detail": "ID de vaga inválido."}, status=status.HTTP_400_BAD_REQUEST
            )

        from .models import Job
        from .serializers import JobSerializer

        local_job = Job.objects.filter(pk=job_id, is_active=True).first()
        if local_job:
            serializer = JobSerializer(local_job)
            data = serializer.data
            data["source"] = "local"
            return Response(data)

        return Response(
            {"detail": "Vaga não encontrada."}, status=status.HTTP_404_NOT_FOUND
        )

    def put(self, request, pk, *args, **kwargs):
        company = get_authenticated_company(request)
        if not company:
            return Response(
                {"detail": "Não autorizado. Faça login como empresa."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from .models import Job
        from .serializers import JobSerializer

        job = get_object_or_404(Job, pk=pk)

        if job.company != company:
            return Response(
                {"detail": "Permissão negada. Esta vaga não pertence à sua empresa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        company = get_authenticated_company(request)
        if not company:
            return Response(
                {"detail": "Não autorizado. Faça login como empresa."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from .models import Job

        job = get_object_or_404(Job, pk=pk)

        if job.company != company:
            return Response(
                {"detail": "Permissão negada. Esta vaga não pertence à sua empresa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job.is_active = False
        job.status = "deleted"
        job.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompanyJobsAPIView(APIView):
    """
    Lista todas as vagas (ativas ou inativas) da empresa autenticada.
    """

    def get(self, request, *args, **kwargs):
        company = get_authenticated_company(request)
        if not company:
            return Response(
                {"detail": "Não autorizado. Faça login como empresa."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from .models import Job
        from .serializers import JobSerializer

        queryset = (
            Job.objects.filter(company=company)
            .exclude(status="deleted")
            .order_by("-created_at")
        )
        serializer = JobSerializer(queryset, many=True)
        return Response(serializer.data)


class JobCandidacyAPIView(APIView):
    """
    Endpoint para realizar candidatura rápida enviando currículo (PDF/DOC/DOCX).
    Envia automaticamente os dados e o anexo por e-mail para o RH cadastrado.
    """

    from rest_framework.parsers import FormParser, MultiPartParser

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk, *args, **kwargs):
        from django.core.mail import EmailMessage
        from django.shortcuts import get_object_or_404

        from .models import Job
        from .serializers import CandidacySerializer

        # 1. Tenta buscar a vaga local no banco
        job = get_object_or_404(Job, pk=pk, is_active=True)

        # 2. Valida e salva os dados da candidatura
        serializer = CandidacySerializer(data=request.data)
        if serializer.is_valid():
            candidacy = serializer.save(job=job)

            # 3. Determina o e-mail de recebimento (ref_email da vaga ou e-mail da empresa)
            recipient_email = job.ref_email or job.company.email
            if recipient_email:
                try:
                    subject = f"[Emprega Jacareí] Nova Candidatura - {job.title}"
                    body = (
                        f"Olá,\n\n"
                        f"Uma nova candidatura foi enviada para a vaga '{job.title}'.\n\n"
                        f"Dados do Candidato:\n"
                        f"- Nome: {candidacy.full_name}\n"
                        f"- E-mail: {candidacy.email}\n"
                        f"- Telefone: {candidacy.phone}\n\n"
                        f"O currículo do candidato está anexado a este e-mail.\n\n"
                        f"Atenciosamente,\n"
                        f"Plataforma Emprega Jacareí"
                    )

                    email = EmailMessage(
                        subject=subject,
                        body=body,
                        from_email=config(
                            "DEFAULT_FROM_EMAIL", default="noreply@jacarei.sp.gov.br"
                        ),
                        to=[recipient_email],
                    )

                    # Anexa o currículo
                    if candidacy.resume:
                        import mimetypes

                        candidacy.resume.open()
                        filename = candidacy.resume.name.split("/")[-1]
                        content_type, _ = mimetypes.guess_type(filename)
                        if not content_type:
                            content_type = "application/octet-stream"
                        email.attach(filename, candidacy.resume.read(), content_type)

                    email.send(fail_silently=False)
                except Exception as mail_err:
                    # Logamos o erro de e-mail mas retornamos 201
                    print(f"Erro ao enviar e-mail de candidatura: {str(mail_err)}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
