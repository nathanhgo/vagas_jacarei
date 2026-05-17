# Vagas Jacareí — Plataforma de Empregos 🏙️

> Plataforma de vagas de emprego da cidade de Jacareí-SP  
> Projeto de Extensão Universitária

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Django 5.1 + Django REST Framework |
| **Frontend** | Next.js 15 + TypeScript + Material UI v6 |
| **Banco de Dados** | PostgreSQL 16 |
| **Infraestrutura** | Docker + Docker Compose |
| **Linting/Formatação** | Ruff |
| **Testes** | pytest + pytest-django |
| **Configuração** | python-decouple + `.env` |

---

## Estrutura de Pastas

```
projeto-extensao/
│
├── backend/                        # Aplicação Django
│   ├── config/                     # Configurações do projeto
│   │   ├── settings/
│   │   │   ├── base.py             # ⚙️ Settings compartilhadas (todas as envs)
│   │   │   ├── development.py      # 🛠️ Overrides para desenvolvimento
│   │   │   └── production.py       # 🚀 Overrides para produção
│   │   ├── urls.py                 # Roteador raiz — /admin/ e /api/
│   │   ├── wsgi.py                 # Entry point WSGI
│   │   └── asgi.py                 # Entry point ASGI (WebSockets)
│   │
│   ├── core/                       # App principal Django
│   │   ├── migrations/             # Migrações de banco geradas automaticamente
│   │   ├── tests/
│   │   │   └── test_ping.py        # 🧪 Testes do endpoint de saúde
│   │   ├── admin.py                # Configurações do Django Admin
│   │   ├── apps.py                 # AppConfig
│   │   ├── models.py               # 📦 Models do banco de dados
│   │   ├── urls.py                 # URLs do app core (/api/ping/, etc.)
│   │   └── views.py                # 🔌 Views / Endpoints da API
│   │
│   ├── conftest.py                 # Fixtures pytest globais (ex: api_client)
│   ├── manage.py                   # CLI do Django
│   ├── requirements.txt            # Dependências Python (pinadas)
│   ├── pyproject.toml              # Configuração do Ruff e pytest
│   ├── Dockerfile                  # Imagem Python 3.12
│   └── .env.example                # Template de variáveis de ambiente
│
├── frontend/                       # Aplicação Next.js
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx          # Layout raiz (MUI Provider, metadados)
│       │   ├── page.tsx            # Página inicial
│       │   └── globals.css         # Reset CSS global
│       ├── components/
│       │   ├── MuiProvider.tsx     # Provider client-side do MUI
│       │   └── PingStatus.tsx      # Componente de status da API
│       ├── lib/
│       │   └── api.ts              # 🔗 Funções de chamada à API (tipadas)
│       └── theme/
│           └── theme.ts            # 🎨 Tema MUI customizado (dark mode)
│
├── .vscode/
│   ├── tasks.json                  # ▶️ Tasks de desenvolvimento (ver abaixo)
│   └── extensions.json             # Extensões VSCode recomendadas
│
├── docker-compose.yml              # Orquestração dos containers
├── .env                            # ⚠️ NUNCA commitar — variáveis reais
├── .env.example                    # Template público das variáveis
├── .gitignore
└── README.md
```

---

## Início Rápido

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose Plugin
- [Node.js 20+](https://nodejs.org/) e npm

### 1. Clonar e configurar o ambiente

```bash
git clone <url-do-repositorio>
cd projeto-extensao

# Copiar e editar o .env
cp .env.example .env
```

Edite o `.env` e substitua `DJANGO_SECRET_KEY` por uma chave segura:
```bash
# Gerar uma chave segura:
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copie o `.env` do frontend:
```bash
cp frontend/.env.example frontend/.env.local
```

### 2. Subir o banco + backend (Docker)

```bash
docker compose up
# ou em background:
docker compose up -d
```

Na primeira execução, aplique as migrações:
```bash
docker compose exec backend python manage.py migrate
```

### 3. Subir o frontend

Em um **segundo terminal**:
```bash
cd frontend
npm install       # só na primeira vez
npm run dev
```

### 4. Acessar

| Serviço | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔌 Backend API | http://localhost:8000/api/ |
| ⚙️ Django Admin | http://localhost:8000/admin/ |
| 🐘 Banco de Dados | `localhost:5433` (ver DBeaver abaixo) |

---

## Conectando ao banco com DBeaver

O PostgreSQL do projeto roda na **porta 5433** (para não conflitar com instalações locais).

**Configurações de conexão:**

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5433` |
| **Database** | `jacarei_vagas_db` |
| **Username** | `jacarei_user` |
| **Password** | `jacarei_dev_password_2024` *(valor do `.env`)* |

**Passo a passo no DBeaver:**
1. Abra o DBeaver → `File > New > Database Connection`
2. Selecione **PostgreSQL** → clique em **Next**
3. Preencha os campos acima
4. Clique em **Test Connection** para validar
5. Clique em **Finish**

> ⚠️ O banco só estará acessível enquanto o container `jacarei_vagas_db` estiver rodando (`docker compose up db`).

---

## Fluxo de Trabalho Diário

### Iniciando o ambiente (via VSCode Tasks)

Acesse as tasks com `Ctrl+Shift+P → Tasks: Run Task`:

| Task | O que faz |
|------|-----------|
| 🚀 **Start All (Docker)** | Sobe o banco + backend |
| ⚡ **Start Frontend** | Inicia o Next.js em `localhost:3000` |
| 📋 **Docker Logs (Backend)** | Ver logs do Django em tempo real |

### Durante o desenvolvimento

| Task | O que faz |
|------|-----------|
| 📦 **Django Make Migrations** | Cria migrações após alterar `models.py` |
| 📦 **Django Migrate** | Aplica migrações pendentes no banco |
| 👤 **Django Create Superuser** | Cria usuário admin para o Django Admin |
| 🧪 **Run Tests** | Executa todos os testes com pytest |
| 🧪 **Run Tests with Coverage** | Testes + relatório de cobertura |
| 🔍 **Ruff Lint** | Verifica erros de código |
| ✨ **Ruff Format (Fix)** | Formata o código automaticamente |

### Encerrando

| Task | O que faz |
|------|-----------|
| 🛑 **Stop All (Docker)** | Para os containers (mantém dados do banco) |
| 🗑️ **Stop All + Remove Volumes** | Para e **apaga** os dados do banco (reset) |

---

## Desenvolvendo no Backend

### Criando um novo endpoint

1. Adicione o model em `backend/core/models.py`
2. Crie a migration: task `📦 Django Make Migrations`
3. Aplique: task `📦 Django Migrate`
4. Crie a view em `backend/core/views.py`
5. Registre a URL em `backend/core/urls.py`
6. Escreva os testes em `backend/core/tests/`
7. Rode: task `🧪 Run Tests`

### Padrão de teste

```python
# backend/core/tests/test_meu_endpoint.py
import pytest
from django.urls import reverse

@pytest.mark.django_db
class TestMeuEndpoint:
    def test_retorna_200(self, client):
        url = reverse("core:meu_endpoint")
        response = client.get(url)
        assert response.status_code == 200
```

### Ruff (lint e format)

```bash
# Verificar erros
docker compose exec backend ruff check .

# Corrigir automaticamente
docker compose exec backend ruff check --fix .

# Formatar código
docker compose exec backend ruff format .
```

---

## Desenvolvendo no Frontend

### Criando uma nova página

```
frontend/src/app/
├── vagas/
│   └── page.tsx        # Acessível em /vagas
├── empresas/
│   └── page.tsx        # Acessível em /empresas
```

### Chamando a API

```typescript
// frontend/src/lib/api.ts — adicione suas funções aqui
export async function fetchVagas(): Promise<Vaga[]> {
  const response = await fetch(`${API_URL}/vagas/`);
  if (!response.ok) throw new Error("Erro ao buscar vagas");
  return response.json();
}
```

---

## Testes

```bash
# Rodar todos os testes
docker compose exec backend pytest

# Teste específico
docker compose exec backend pytest core/tests/test_ping.py -v

# Com cobertura de código
docker compose exec backend pytest --cov=. --cov-report=term-missing
```

---

## Variáveis de Ambiente

### Raiz (`.env`)

| Variável | Descrição | Valor padrão (dev) |
|----------|-----------|-------------------|
| `POSTGRES_DB` | Nome do banco | `jacarei_vagas_db` |
| `POSTGRES_USER` | Usuário PostgreSQL | `jacarei_user` |
| `POSTGRES_PASSWORD` | Senha do banco | `jacarei_dev_password_2024` |
| `POSTGRES_HOST` | Host do banco | `localhost` |
| `POSTGRES_PORT` | Porta do banco | `5433` |
| `DJANGO_SECRET_KEY` | Chave secreta Django | *(gere com secrets.token_urlsafe)* |
| `DJANGO_DEBUG` | Modo debug | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1,0.0.0.0` |
| `CORS_ALLOWED_ORIGINS` | Origins do frontend | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` |

---

## Endpoints da API

| Método | URL | Descrição |
|--------|-----|-----------|
| `GET` | `/api/ping/` | Health-check da API |
| `GET/POST` | `/admin/` | Django Admin |

---

## Contribuindo

1. Leia o fluxo de branches do projeto (ver seção abaixo ou `CONTRIBUTING.md`)
2. Crie uma branch a partir de `dev`: `git checkout -b feature/nome-da-feature`
3. Faça commits pequenos e descritivos
4. Rode os testes antes de abrir PR: `docker compose exec backend pytest`
5. Verifique o linting: `docker compose exec backend ruff check .`
6. Abra um **Pull Request para a branch `dev`**

### Fluxo de Branches

```
main          ← produção (apenas o Scrum Master faz merge)
  └── dev     ← integração (PRs dos devs vão para cá)
        └── feature/nome-da-feature   ← sua branch de trabalho
        └── fix/nome-do-bug
```

---

*Projeto de Extensão Universitária — Jacareí, SP*
