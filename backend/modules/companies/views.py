from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company
from .serializers import CompanySerializer


class CompanyListAPIView(APIView):
    """
    GET: List all companies with pagination and search
    POST: Create a new company
    """

    def get(self, request, *args, **kwargs):
        page = request.query_params.get("page", 1)
        try:
            page = int(page)
            if page < 1:
                page = 1
        except ValueError:
            page = 1

        page_size = request.query_params.get("page_size", 10)
        try:
            page_size = int(page_size)
            if page_size < 1:
                page_size = 10
        except ValueError:
            page_size = 10

        search_query = request.query_params.get("search", "")

        queryset = Company.objects.all()

        if search_query:
            queryset = queryset.filter(name__icontains=search_query)

        count = queryset.count()
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        results = queryset[start_idx:end_idx]
        serializer = CompanySerializer(results, many=True)

        next_page = None
        if page * page_size < count:
            next_page = f"/api/companies/?page={page + 1}&page_size={page_size}"
            if search_query:
                next_page += f"&search={search_query}"

        prev_page = None
        if page > 1:
            prev_page = f"/api/companies/?page={page - 1}&page_size={page_size}"
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
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyDetailAPIView(APIView):
    """
    GET: Retrieve a specific company by ID
    PUT: Update a specific company
    DELETE: Delete a specific company
    """

    def get(self, request, pk, *args, **kwargs):
        company = get_object_or_404(Company, pk=pk)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def put(self, request, pk, *args, **kwargs):
        company = get_object_or_404(Company, pk=pk)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        company = get_object_or_404(Company, pk=pk)
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompanyLoginAPIView(APIView):
    """
    Login de empresa usando CNPJ, E-mail e Senha.
    """

    def post(self, request, *args, **kwargs):
        cnpj = request.data.get("cnpj", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()

        if not cnpj or not email or not password:
            return Response(
                {"detail": "CNPJ, E-mail e Senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company = Company.objects.filter(cnpj=cnpj, email=email).first()
        if not company:
            return Response(
                {"detail": "Empresa não encontrada com os dados informados. Verifique o CNPJ e o E-mail."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not company.check_password(password):
            return Response(
                {"detail": "Senha incorreta."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = CompanySerializer(company)
        return Response({"company": serializer.data, "token": cnpj})
