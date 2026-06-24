import { test, expect } from "@playwright/test";
import { MOCK_JOBS } from "./mocks";

test.describe("Portal de Vagas - Fluxo Público de Vagas", () => {
  test.beforeEach(async ({ page }) => {
    // Escutar console e erros do browser para depuração
    page.on("console", msg => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`));
    page.on("pageerror", err => console.log(`[BROWSER EXCEPTION] ${err.message}`));
    page.on("request", req => console.log(`[REQ] ${req.method()} ${req.url()}`));
    page.on("response", res => console.log(`[RES] ${res.status()} ${res.url()}`));

    // Interceptar OPTIONS preflights globais e usar route.fallback() para outros métodos
    await page.route(/\/api\/.*/, async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } else {
        await route.fallback();
      }
    });

    // Interceptar NextAuth session fetch do browser para evitar erros de render
    await page.route(/\/api\/auth\/session/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    // Mockar chamada de ping
    await page.route(/\/api\/ping\/?/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "pong", status: "ok", django_version: "5.1" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    // Mockar listagem de vagas inicial
    await page.route(/\/api\/jobs\/\?page=1&page_size=6$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 2,
          next: null,
          previous: null,
          results: MOCK_JOBS,
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });
  });

  test("deve listar vagas públicas e permitir busca", async ({ page }) => {
    await page.goto("/vagas");

    // Verificar se as duas vagas mocadas estão visíveis
    await expect(page.locator("text=Desenvolvedor Full Stack Django/Next.js")).toBeVisible();
    await expect(page.locator("text=Estagiário de Front-end")).toBeVisible();

    // Mockar busca por termo específico
    await page.route(/\/api\/jobs\/\?page=1&page_size=6&search=Estagi%C3%A1rio$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [MOCK_JOBS[1]], // Apenas Estagiário
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    // Preencher input de busca
    const searchInput = page.getByPlaceholder("Pesquisar vagas, cargos ou empresas...");
    await searchInput.fill("Estagiário");
    await searchInput.press("Enter");

    // Apenas a vaga de Estagiário deve estar visível
    await expect(page.locator("text=Estagiário de Front-end")).toBeVisible();
    await expect(page.locator("text=Desenvolvedor Full Stack Django/Next.js")).not.toBeVisible();
  });

  test("deve visualizar detalhes de uma vaga e candidatar-se com sucesso", async ({ page }) => {
    // Mockar detalhes da vaga ID 1
    await page.route(/\/api\/jobs\/1\/?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_JOBS[0]),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    // Mockar sucesso na candidatura (POST /api/jobs/1/apply/)
    await page.route(/\/api\/jobs\/1\/apply\/?/, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "Candidatura enviada!" }),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/vagas/1");

    // Verificar se renderizou as informações da vaga
    await expect(page.locator("h3:has-text('Desenvolvedor Full Stack Django/Next.js')")).toBeVisible();
    await expect(page.locator("text=Vaga para desenvolvedor full stack experiente.")).toBeVisible();

    // Clicar no botão para abrir o formulário de candidatura
    await page.click("button:has-text('Candidatar-se à Vaga')");

    // Preencher dados do candidato usando locadores de labels do Playwright
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome Completo").fill("Candidato de Teste");
    await dialog.getByLabel("E-mail").fill("candidato@teste.com");
    await dialog.getByLabel("Telefone / WhatsApp").fill("(12) 98888-7777");

    // Injetar arquivo diretamente no input file
    await page.locator("input[type='file']").setInputFiles({
      name: "curriculo.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fictional pdf content"),
    });

    // Submeter formulário programaticamente para garantir o disparo
    await dialog.locator("form").evaluate(form => {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    // Deve exibir mensagem de sucesso
    await expect(page.locator("text=Candidatura Enviada!")).toBeVisible();
  });
});
