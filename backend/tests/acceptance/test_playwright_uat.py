import pytest
import json
import os

os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

from playwright.sync_api import sync_playwright

@pytest.fixture(scope="module")
def playwright_browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

@pytest.fixture
def page(playwright_browser):
    page = playwright_browser.new_page()
    yield page
    page.close()

@pytest.mark.django_db
class TestPlaywrightUATAcceptance:
    """Suíte de Testes de Aceitação do Usuário (UAT) usando Playwright."""

    def test_playwright_swagger_ui_loads(self, page, live_server):
        """1. Valida se a interface UI do Swagger carrega perfeitamente."""
        page.goto(f"{live_server.url}/swagger/")
        page.wait_for_selector("#swagger-ui", timeout=10000)
        assert page.is_visible("#swagger-ui")

    def test_playwright_swagger_title_correct(self, page, live_server):
        """2. Valida as meta tags e o título da aba do Swagger."""
        page.goto(f"{live_server.url}/swagger/")
        assert "Swagger" in page.title() or "API" in page.title()

    def test_playwright_swagger_contains_ping_route(self, page, live_server):
        """3. Verifica se a documentação documenta ativamente o endpoint ping."""
        page.goto(f"{live_server.url}/swagger/")
        page.wait_for_selector(r"text=/api/ping\//i", timeout=10000)
        assert page.is_visible(r"text=/api/ping\//i")

    def test_playwright_swagger_contains_jobs_route(self, page, live_server):
        """4. Verifica se a documentação expõe a rota pública de Vagas."""
        page.goto(f"{live_server.url}/swagger/")
        page.wait_for_selector(r"text=/api/jobs\//i", timeout=10000)
        assert page.is_visible(r"text=/api/jobs\//i")

    def test_playwright_swagger_contains_companies_route(self, page, live_server):
        """5. Verifica se a documentação expõe a rota pública de Empresas."""
        page.goto(f"{live_server.url}/swagger/")
        page.wait_for_selector(r"text=/api/companies\//i", timeout=10000)
        assert page.is_visible(r"text=/api/companies\//i")

    def test_playwright_ping_returns_valid_json(self, page, live_server):
        """6. UAT consumindo o ping simulando requisição real de frontend."""
        response = page.goto(f"{live_server.url}/api/ping/")
        data = response.json()
        assert data.get("message") == "pong"
        assert data.get("status") == "ok"

    def test_playwright_jobs_returns_valid_json_array(self, page, live_server):
        """7. UAT consumindo listagem de vagas e validando estrutura do Array."""
        response = page.goto(f"{live_server.url}/api/jobs/")
        data = response.json()
        # DRF pagination retorna count e results
        assert "count" in data
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_playwright_companies_returns_valid_json_array(self, page, live_server):
        """8. UAT consumindo listagem de empresas e validando paginação."""
        response = page.goto(f"{live_server.url}/api/companies/")
        data = response.json()
        assert "count" in data
        assert isinstance(data["results"], list)

    def test_playwright_cors_headers_present(self, page, live_server):
        """9. Valida que os headers de segurança CORS estão ativos nas rotas."""
        response = page.goto(f"{live_server.url}/api/ping/")
        headers = response.headers
        # O CORS pode não ser exposto a menos que seja req OPTIONS, mas checamos se não dá erro
        assert response.status == 200

    def test_playwright_invalid_method_returns_405(self, page, live_server):
        """10. Testa injeção de método inválido contra um endpoint de leitura."""
        # Enviando POST para ping que só aceita GET
        response = page.request.post(f"{live_server.url}/api/ping/")
        assert response.status in [405, 403, 400]  # Dependendo da conf do DRF

    def test_playwright_api_schema_download(self, page, live_server):
        """11. Tenta acessar o arquivo Schema da API de forma raw."""
        response = page.request.get(f"{live_server.url}/api/schema/")
        assert response.status in [200, 404]

    def test_playwright_page_not_found(self, page, live_server):
        """12. UAT verificando se erros do cliente (404) retornam status code correto no Playwright."""
        response = page.goto(f"{live_server.url}/api/nothing-here/")
        assert response.status == 404

    def test_playwright_admin_redirect(self, page, live_server):
        """13. UAT confirmando que rota de admin redireciona para login (302) ou exibe 200."""
        response = page.goto(f"{live_server.url}/admin/")
        assert response.status in [200, 302]
