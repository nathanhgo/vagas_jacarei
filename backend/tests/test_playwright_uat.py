import pytest
from playwright.sync_api import sync_playwright

@pytest.mark.django_db
def test_user_acceptance_playwright_uat(live_server):
    """Executa um fluxo UAT mínimo via Playwright para o site."""
    url = f"{live_server.url}/swagger/"

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()

        # Acessa a página de documentação Swagger / site público.
        page.goto(url)
        page.wait_for_load_state("networkidle")
        page.wait_for_selector("#swagger-ui", timeout=15000)
        title = page.title()
        assert "Swagger" in title or "Vagas" in title

        # Valida que a página contém endpoints de API esperados.
        page.wait_for_selector(r"text=/api/ping\//i", timeout=15000)
        page.wait_for_selector(r"text=/api/jobs\//i", timeout=15000)
        page.wait_for_selector(r"text=/api/companies\//i", timeout=15000)

        # Acessa o endpoint ping para validar o site em execução.
        page.goto(f"{live_server.url}/api/ping/")
        body_text = page.text_content("body")
        assert "pong" in body_text
        assert "django_version" in body_text

        # Acessa o endpoint jobs e verifica o formato JSON mínimo.
        page.goto(f"{live_server.url}/api/jobs/")
        jobs_body = page.text_content("body")
        assert "[" in jobs_body or "title" in jobs_body

        # Acessa o endpoint companies e verifica o formato JSON mínimo.
        page.goto(f"{live_server.url}/api/companies/")
        companies_body = page.text_content("body")
        assert "[" in companies_body or "name" in companies_body

        browser.close()
