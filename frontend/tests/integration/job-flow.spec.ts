import { test, expect } from "@playwright/test";
import { MOCK_JOBS } from "./mocks";

test.describe("Portal de Vagas - Fluxo Público de Vagas", () => {
  test.beforeEach(async ({ page }) => {
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

    await page.route(/\/api\/auth\/session/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

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

    await expect(page.locator("text=Desenvolvedor Full Stack Django/Next.js")).toBeVisible();
    await expect(page.locator("text=Estagiário de Front-end")).toBeVisible();

    await page.route(/\/api\/jobs\/\?page=1&page_size=6&search=Estagi%C3%A1rio$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [MOCK_JOBS[1]],
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    const searchInput = page.getByPlaceholder("Pesquisar vagas, cargos ou empresas...");
    await searchInput.fill("Estagiário");
    await searchInput.press("Enter");

    await expect(page.locator("text=Estagiário de Front-end")).toBeVisible();
    await expect(page.locator("text=Desenvolvedor Full Stack Django/Next.js")).not.toBeVisible();
  });

  test("deve visualizar detalhes de uma vaga e candidatar-se com sucesso", async ({ page }) => {
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

    await expect(page.locator("h3:has-text('Desenvolvedor Full Stack Django/Next.js')")).toBeVisible();
    await expect(page.locator("text=Vaga para desenvolvedor full stack experiente.")).toBeVisible();

    await page.click("button:has-text('Candidatar-se à Vaga')");

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome Completo").fill("Candidato de Teste");
    await dialog.getByLabel("E-mail").fill("candidato@teste.com");
    await dialog.getByLabel("Telefone / WhatsApp").fill("(12) 98888-7777");

    await page.locator("input[type='file']").setInputFiles({
      name: "curriculo.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fictional pdf content"),
    });

    await dialog.locator("form").evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    await expect(page.locator("text=Candidatura Enviada!")).toBeVisible();
  });
});
