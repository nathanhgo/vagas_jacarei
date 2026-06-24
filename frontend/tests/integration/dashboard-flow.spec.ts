import { test, expect } from "@playwright/test";
import { MOCK_JOBS, MOCK_CANDIDACIES } from "./mocks";

test.describe("Portal da Empresa - Área Logada / Painel", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("companyToken", "mocked-jwt-token-12345");
      window.localStorage.setItem(
        "companyData",
        JSON.stringify({
          id: 101,
          name: "Empresa Tecnologia Jacareí",
          cnpj: "12.345.678/0001-99",
        })
      );
    });

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
        body: JSON.stringify({ message: "pong", status: "ok" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    await page.route(/\/api\/jobs\/my-jobs\/?/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_JOBS),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });
  });

  test("deve listar vagas da própria empresa no painel", async ({ page }) => {
    await page.goto("/empresa/minhas-vagas");

    await expect(page.locator("h4:has-text('Minhas vagas')")).toBeVisible();
    await expect(page.locator("text=Desenvolvedor Full Stack Django/Next.js")).toBeVisible();
    await expect(page.locator("text=Estagiário de Front-end")).toBeVisible();
  });

  test("deve criar uma nova vaga com sucesso", async ({ page }) => {
    await page.route(/\/api\/jobs\/?$/, async (route) => {
      if (route.request().method() === "POST") {
        const payload = JSON.parse(route.request().postData() || "{}");
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 3,
            title: payload.title,
            description: payload.description,
            company: "Empresa Tecnologia Jacareí",
            location: "Jacareí - SP",
            created_at: new Date().toISOString(),
          }),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/empresa/minhas-vagas");
    await page.click("button:has-text('Publicar Nova Vaga')");

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Cargo / Título da Vaga").fill("Designer UI/UX");
    await dialog.getByLabel("Descrição Completa da Vaga").fill("Responsável pelo design visual de sistemas.");
    await dialog.getByLabel("Salário Mensal (R$)").fill("4000");
    await dialog.getByLabel("Quantidade de Vagas").fill("1");

    await dialog.locator("form").evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    await expect(page.locator("text=Nova vaga criada com sucesso!")).toBeVisible();
  });

  test("deve exibir detalhes da vaga e candidatos ao clicar no título", async ({ page }) => {
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

    await page.route(/\/api\/jobs\/1\/candidacies\/?/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_CANDIDACIES),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });

    await page.goto("/empresa/minhas-vagas");
    await page.click("text=Desenvolvedor Full Stack Django/Next.js");

    await expect(page).toHaveURL(/\/empresa\/vagas\/1/);

    await expect(page.locator("h4:has-text('Desenvolvedor Full Stack Django/Next.js')")).toBeVisible();
    await expect(page.locator("text=Candidatos Inscritos (2)")).toBeVisible();
    await expect(page.locator("text=João Silva da Costa")).toBeVisible();
    await expect(page.locator("text=Maria Oliveira Santos")).toBeVisible();
  });

  test("deve finalizar uma vaga com sucesso", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Tem certeza que deseja finalizar esta vaga?");
      await dialog.accept();
    });

    await page.route(/\/api\/jobs\/1\/?$/, async (route) => {
      if (route.request().method() === "PUT") {
        const payload = JSON.parse(route.request().postData() || "{}");
        expect(payload.is_active).toBe(false);
        expect(payload.status).toBe("finalized");

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...MOCK_JOBS[0],
            is_active: false,
            status: "finalized",
          }),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto("/empresa/minhas-vagas");
    await page.locator("button:has-text('Finalizar')").first().click();

    await expect(page.locator("text=Vaga finalizada com sucesso!")).toBeVisible();
  });
});
