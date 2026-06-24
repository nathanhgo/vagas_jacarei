import { test, expect } from "@playwright/test";
import { MOCK_COMPANY } from "./mocks";

test.describe("Portal da Empresa - Fluxo de Autenticação", () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que começamos limpos sem localStorage ou sessão mockada
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("deve realizar login tradicional com sucesso e redirecionar", async ({ page }) => {
    // Mockar requisição de login da API Backend
    await page.route("**/api/companies/login/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mocked-jwt-token-12345",
          company: MOCK_COMPANY,
        }),
      });
    });

    // Acessar página de login da empresa
    await page.goto("/empresa");

    // Preencher campos
    await page.fill("#login-cnpj", "12.345.678/0001-99");
    await page.fill("#login-email", "contato@techjacarei.com.br");
    await page.fill("#login-password", "senha123");

    // Enviar formulário
    await page.click('button:has-text("Entrar no Painel")');

    // Verificar se redirecionou para minhas-vagas
    await expect(page).toHaveURL(/\/empresa\/minhas-vagas/);

    // Verificar itens salvos no localStorage
    const companyToken = await page.evaluate(() => localStorage.getItem("companyToken"));
    const companyData = await page.evaluate(() => localStorage.getItem("companyData"));
    
    expect(companyToken).toBe("mocked-jwt-token-12345");
    expect(JSON.parse(companyData || "{}").name).toBe("Empresa Tecnologia Jacareí");
  });

  test("deve exibir erro ao falhar no login tradicional", async ({ page }) => {
    await page.route("**/api/companies/login/", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "CNPJ, E-mail ou Senha incorretos." }),
      });
    });

    await page.goto("/empresa");

    await page.fill("#login-cnpj", "12.345.678/0001-99");
    await page.fill("#login-email", "contato@techjacarei.com.br");
    await page.fill("#login-password", "senha_errada");

    await page.click('button:has-text("Entrar no Painel")');

    // Deve mostrar o alerta de erro na tela
    const errorAlert = page.locator(".MuiAlert-message");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText(/CNPJ, E-mail ou Senha incorretos./);
  });

  test("deve cadastrar uma nova empresa com sucesso", async ({ page }) => {
    await page.route("**/api/companies/", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(MOCK_COMPANY),
      });
    });

    await page.goto("/empresa");

    // Clicar na aba de criar conta
    await page.click('button:has-text("Criar Conta")');

    // Preencher campos obrigatórios
    await page.fill("#reg-name", "Empresa Tecnologia Jacareí");
    await page.fill("#reg-cnpj", "12.345.678/0001-99");
    await page.fill("#reg-email", "contato@techjacarei.com.br");
    await page.fill("#reg-phone", "(12) 99999-9999");
    await page.fill("#reg-password", "senha123");
    await page.fill("#reg-confirm-password", "senha123");

    // Enviar formulário
    await page.click('button:has-text("Cadastrar Empresa")');

    // Deve redirecionar para minhas-vagas
    await expect(page).toHaveURL(/\/empresa\/minhas-vagas/);
  });

  test("deve validar senhas incompatíveis no cadastro", async ({ page }) => {
    await page.goto("/empresa");

    await page.click('button:has-text("Criar Conta")');

    await page.fill("#reg-name", "Empresa Incompatível");
    await page.fill("#reg-cnpj", "12.345.678/0001-99");
    await page.fill("#reg-email", "contato@incompativel.com.br");
    await page.fill("#reg-password", "senha123");
    await page.fill("#reg-confirm-password", "senha_diferente");

    await page.click('button:has-text("Cadastrar Empresa")');

    // Deve exibir alerta de erro e não cadastrar
    const errorAlert = page.locator(".MuiAlert-message");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText(/As senhas não conferem./);
  });

  test("deve realizar Google Login com sucesso caso a empresa exista", async ({ page }) => {
    // Mock NextAuth active session check
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            name: "Parceiro Jacarei",
            email: "contato@techjacarei.com.br",
            image: "https://lh3.googleusercontent.com/a/default-user",
          },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });

    // Mock Backend Google Auth success response
    await page.route("**/api/companies/google-auth/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mocked-google-jwt-token-99999",
          company: MOCK_COMPANY,
        }),
      });
    });

    // Acessar página de login para engatilhar a detecção da sessão ativa
    await page.goto("/empresa");

    // O useEffect deve disparar automaticamente
    await expect(page).toHaveURL(/\/empresa\/minhas-vagas/);

    const companyToken = await page.evaluate(() => localStorage.getItem("companyToken"));
    expect(companyToken).toBe("mocked-google-jwt-token-99999");
  });

  test("deve redirecionar para completar cadastro caso a empresa do Google Login seja nova", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            name: "Novo Usuário Google",
            email: "novo.google@email.com",
          },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });

    // Mock backend retornando que precisa de cadastro complementar
    await page.route("**/api/companies/google-auth/", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ need_registration: true }),
      });
    });

    await page.goto("/empresa");

    // O useEffect deve redirecionar para completar cadastro
    await expect(page).toHaveURL(/\/empresa\/completar-cadastro/);
  });
});
