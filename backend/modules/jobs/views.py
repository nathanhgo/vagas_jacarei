import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from decouple import config
from modules.jobs.services import JobSyncService

class JobListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        APP_ID = config("ADZUNA_APP_ID", default="")
        APP_KEY = config("ADZUNA_APP_KEY", default="")
        
        if not APP_ID or not APP_KEY:
            return Response(
                {"error": "ADZUNA_APP_ID ou ADZUNA_APP_KEY não configurados no backend."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
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
        
        url = f"https://api.adzuna.com/v1/api/jobs/br/search/{page}"
        params = {
            "app_id": APP_ID,
            "app_key": APP_KEY,
            "results_per_page": page_size,
            "where": "Jacarei",
            "content-type": "application/json"
        }
        if search_query:
            params["what"] = search_query
            
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = data.get("count", 0)
                results = data.get("results", [])
                
                formatted_jobs = []
                for item in results:
                    try:
                        job_id = int(item.get("id"))
                    except (ValueError, TypeError):
                        continue
                        
                    title = item.get("title", "")
                    company = item.get("company", {}).get("display_name", "Empresa Não Informada")
                    description = item.get("description", "")
                    external_link = item.get("redirect_url", "")
                    salary = item.get("salary_min", None)
                    created_at = item.get("created", "")
                    
                    extracted_text = f"{title} {description}"
                    neighborhood = JobSyncService.extract_neighborhood(extracted_text)
                    
                    source = "adzuna"
                    if "indeed" in external_link.lower():
                        source = "indeed"
                    elif "vagas.com" in external_link.lower():
                        source = "vagas"
                        
                    job_data = {
                        "id": job_id,
                        "title": title,
                        "company": company,
                        "description": description,
                        "external_link": external_link,
                        "source": source,
                        "location": "Jacareí - SP",
                        "neighborhood": neighborhood,
                        "salary": salary,
                        "is_active": True,
                        "created_at": created_at
                    }
                    
                    cache.set(f"job_details_{job_id}", job_data, timeout=3600) # 1 hour TTL
                    formatted_jobs.append(job_data)
                    
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
                        
                return Response({
                    "count": count,
                    "next": next_page,
                    "previous": prev_page,
                    "results": formatted_jobs
                })
            else:
                return Response(
                    {"error": f"Erro da API externa Adzuna: {response.text}"},
                    status=response.status_code
                )
        except Exception as e:
            return Response(
                {"error": f"Falha de conexão com a API externa: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )

class JobDetailAPIView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            job_id = int(pk)
        except (ValueError, TypeError):
            return Response(
                {"detail": "ID de vaga inválido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cached_job = cache.get(f"job_details_{job_id}")
        if cached_job:
            return Response(cached_job)
            
        APP_ID = config("ADZUNA_APP_ID", default="")
        APP_KEY = config("ADZUNA_APP_KEY", default="")
        
        if not APP_ID or not APP_KEY:
            return Response(
                {"error": "ADZUNA_APP_ID ou ADZUNA_APP_KEY não configurados no backend."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        url = "https://api.adzuna.com/v1/api/jobs/br/search/1"
        params = {
            "app_id": APP_ID,
            "app_key": APP_KEY,
            "results_per_page": 1,
            "what": str(job_id),
            "where": "Jacarei",
            "content-type": "application/json"
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                results = response.json().get("results", [])
                for item in results:
                    try:
                        item_id = int(item.get("id"))
                    except (ValueError, TypeError):
                        continue
                        
                    if item_id == job_id:
                        title = item.get("title", "")
                        company = item.get("company", {}).get("display_name", "Empresa Não Informada")
                        description = item.get("description", "")
                        external_link = item.get("redirect_url", "")
                        salary = item.get("salary_min", None)
                        created_at = item.get("created", "")
                        
                        extracted_text = f"{title} {description}"
                        neighborhood = JobSyncService.extract_neighborhood(extracted_text)
                        
                        source = "adzuna"
                        if "indeed" in external_link.lower():
                            source = "indeed"
                        elif "vagas.com" in external_link.lower():
                            source = "vagas"
                            
                        job_data = {
                            "id": job_id,
                            "title": title,
                            "company": company,
                            "description": description,
                            "external_link": external_link,
                            "source": source,
                            "location": "Jacareí - SP",
                            "neighborhood": neighborhood,
                            "salary": salary,
                            "is_active": True,
                            "created_at": created_at
                        }
                        
                        cache.set(f"job_details_{job_id}", job_data, timeout=3600)
                        return Response(job_data)
                
                return Response(
                    {"detail": "Vaga não encontrada na API externa."},
                    status=status.HTTP_404_NOT_FOUND
                )
            else:
                return Response(
                    {"error": f"Erro da API externa Adzuna: {response.text}"},
                    status=response.status_code
                )
        except Exception as e:
            return Response(
                {"error": f"Falha ao consultar a API externa: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )
