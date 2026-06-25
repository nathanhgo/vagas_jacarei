# Roteiro de Apresentação: Arquitetura de Testes - Vagas Jacareí

Este documento centraliza todas as informações técnicas e métricas da automação de testes do projeto para uso durante a apresentação para a banca/professor.

---

## 📊 1. O Número Mágico: De onde vêm os "86%"?
Se o professor perguntar: *"Como vocês chegaram nesse número de 86% de cobertura?"*
**Resposta:** "Esse número foi gerado pela biblioteca `pytest-cov`. Nós configuramos a ferramenta para ler todo o nosso código-fonte (Models, Views, Serializers e Services na pasta `/modules`) durante a execução de toda a nossa bateria de testes do backend. O relatório acusou que, de um total de 644 linhas de código bruto que nós programamos, 139 linhas foram abstrações vazias ou imports, e todo o restante do código crítico foi executado e atestado pelas asserções. Ou seja, **86% de toda a nossa lógica de negócio em Python foi posta à prova pelos testes automáticos.**"

---

## 🏛️ 2. A Pirâmide de Testes (Resumo)
Construímos uma suíte massiva de **94 Cenários Automatizados** distribuídos entre 5 tipos de testes e utilizando 6 ferramentas líderes de mercado (Pytest, Unittest, Selenium, Playwright, Locust e Mutmut).

### 🔹 Nível 1: Testes de Unidade
*   **Quantidade:** 46 testes.
*   **Ferramentas:** `pytest` e a nativa `unittest`.
*   **Técnicas Utilizadas:** Valor Limite e Classes de Equivalência.
*   **O que validamos:** As regras de negócio estritas. Identificamos e bloqueamos brechas (ex: impedir salários zerados e CLT abaixo do mínimo legal).

### 🔹 Nível 2: Testes de Integração
*   **Quantidade:** 25 testes (13 no Backend, 12 no Frontend).
*   **Ferramentas:** `pytest-django` (Bottom-up) e `Playwright` (Top-down).
*   **O que validamos:** 
    *   No Backend (Bottom-up): Garantimos que as rotas da API se comunicam corretamente com o banco de dados. Utilizamos **Mocks** (respostas falsas) para isolar APIs externas (Adzuna).
    *   No Frontend (Top-down): O navegador simula o usuário interagindo com as telas de React (Next.js) enquanto as rotas de rede estão isoladas.

### 🔹 Nível 3: Testes de Aceitação
*   **Quantidade:** 23 testes (10 Alfa, 13 UAT).
*   **Ferramentas:** `Selenium` e `Playwright`.
*   **O que validamos:**
    *   **Selenium (Alfa / Smoke Test):** Navegador real conferindo se o servidor no ar não quebrou rotas fundamentais, atestando health-checks (ping).
    *   **Playwright (UAT / Teste Beta):** Simulação da jornada consumindo nossa documentação (Swagger) e testando a segurança (CORS) em ambiente de produção emulada.

### 🔹 Nível 4: Teste de Mutação
*   **Ferramenta:** `mutmut`
*   **O que fizemos:** Injetamos bugs propositais no nosso próprio código (ex: mudar um `==` para `!=`) para testar se os nossos Testes Unitários percebiam a sabotagem. Identificamos limitações no cache em memória do Django que exigiram runners customizados.

### 🔹 Nível 5: Testes de Desempenho (Sistema)
*   **Ferramentas:** `Locust` e `k6` (via Docker).
*   **Descobertas do Teste de Carga:** Simulamos 125 acessos simultâneos por 30 segundos batendo na raiz da API. 
*   **A Limitação Encontrada:** "Professor, nosso teste não encontrou falhas no código, mas identificou um **Gargalo Arquitetural de Infraestrutura**. Com o Django rodando isolado localmente (1 worker e sem cache Redis), o sistema estressou e enfileirou conexões após atingir **36 requisições/segundo**. Tivemos 26,3% de falhas (Timeouts) devido ao hardware. Isso provou que nosso código está pronto, mas antes de ir para Produção em Nuvem, será mandatório escalarmos contêineres horizontalmente e aplicarmos Cache."

---

## 🎯 3. Conclusão Final do Grupo
*"A implementação dessa Pirâmide transformou nosso projeto. Deixamos de ter um código que **'achamos que funciona'**, para ter uma arquitetura de engenharia madura onde conhecemos matematicamente: as garantias de lógica de negócios, a fluidez do Frontend e as exatas limitações da nossa infraestrutura. Nosso ambiente atesta 94 cenários de forma 100% automatizada a cada execução."*
