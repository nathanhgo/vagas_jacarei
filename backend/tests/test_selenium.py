import pytest
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


@pytest.mark.django_db
def test_ping_endpoint_is_accessible_using_selenium(live_server):
    """Verifica que o endpoint de health-check do site está acessível via Selenium."""
    options = Options()
    options.binary_location = "/usr/bin/chromium"
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")

    service = Service("/usr/bin/chromedriver")

    try:
        driver = webdriver.Chrome(service=service, options=options)
    except WebDriverException as exc:
        pytest.skip(f"Selenium Chromium não está disponível no ambiente: {exc}")

    try:
        driver.get(f"{live_server.url}/api/ping/")
        assert "pong" in driver.page_source
        assert "django_version" in driver.page_source
    finally:
        driver.quit()
