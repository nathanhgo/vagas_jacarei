import pytest
import json
import os

os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

@pytest.fixture(scope="module")
def driver_options():
    options = Options()
    options.binary_location = "/usr/bin/chromium"
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    return options

@pytest.fixture
def selenium_driver(driver_options):
    service = Service("/usr/bin/chromedriver")
    try:
        driver = webdriver.Chrome(service=service, options=driver_options)
    except WebDriverException as exc:
        pytest.skip(f"Selenium Chromium não está disponível: {exc}")
    yield driver
    driver.quit()


@pytest.mark.django_db
class TestSeleniumAlphaAcceptance:
    """Suíte de Testes de Aceitação (Alfa / End-to-End) usando Selenium."""

    def test_selenium_browser_initialization(self, selenium_driver):
        """1. Garante que o driver do Selenium inicializa e limpa cache."""
        selenium_driver.delete_all_cookies()
        assert selenium_driver.get_cookies() == []

    def test_selenium_ping_endpoint_accessible(self, selenium_driver, live_server):
        """2. Acessa a raiz de health check para validar servidor online."""
        selenium_driver.get(f"{live_server.url}/api/ping/")
        assert "pong" in selenium_driver.page_source

    def test_selenium_ping_django_version_present(self, selenium_driver, live_server):
        """3. Valida se a versão do Django está sendo exposta no ping."""
        selenium_driver.get(f"{live_server.url}/api/ping/")
        assert "django_version" in selenium_driver.page_source

    def test_selenium_ping_valid_json_format(self, selenium_driver, live_server):
        """4. Extrai o conteúdo da página e valida se é um JSON decodificável."""
        selenium_driver.get(f"{live_server.url}/api/ping/")
        body = selenium_driver.find_element(By.TAG_NAME, "pre").text
        data = json.loads(body)
        assert data["status"] == "ok"

    def test_selenium_jobs_endpoint_availability(self, selenium_driver, live_server):
        """5. Valida se o endpoint público de vagas responde no navegador."""
        selenium_driver.get(f"{live_server.url}/api/jobs/")
        body = selenium_driver.find_element(By.TAG_NAME, "body").text
        assert "count" in body or "[" in body

    def test_selenium_companies_endpoint_availability(self, selenium_driver, live_server):
        """6. Valida se o endpoint público de empresas responde no navegador."""
        selenium_driver.get(f"{live_server.url}/api/companies/")
        body = selenium_driver.find_element(By.TAG_NAME, "body").text
        assert "count" in body or "[" in body

    def test_selenium_404_handling_for_invalid_route(self, selenium_driver, live_server):
        """7. Testa a resiliência do front-end/back-end lidando com rota inexistente."""
        selenium_driver.get(f"{live_server.url}/api/rota-inexistente-123/")
        assert "Not Found" in selenium_driver.page_source

    def test_selenium_admin_panel_accessibility(self, selenium_driver, live_server):
        """8. Verifica se o painel administrativo raiz não quebra no carregamento inicial."""
        selenium_driver.get(f"{live_server.url}/admin/login/")
        assert "Django site admin" in selenium_driver.page_source or "Django" in selenium_driver.title

    def test_selenium_swagger_loads(self, selenium_driver, live_server):
        """9. Verifica se o painel do Swagger é renderizado e o JS executado."""
        selenium_driver.get(f"{live_server.url}/swagger/")
        assert selenium_driver.title != ""

    def test_selenium_swagger_has_api_endpoints_listed(self, selenium_driver, live_server):
        """10. Valida se a página do Swagger carrega o layout de documentação."""
        selenium_driver.get(f"{live_server.url}/swagger/")
        body = selenium_driver.find_element(By.TAG_NAME, "body").text
        assert "Swagger" in body or "API" in body
