## 0. Requisitos

| Ferramenta | Como conferir |
|---|---|
| Node.js 24 LTS | `node --version` → deve mostrar `v24.x` |
| Docker Desktop + Compose v2 | `docker --version` e `docker compose version` |
| Git | `git --version` |

---

## 1. Banco de dados (MySQL)

Na **raiz do projeto**:

```bash
cp .env.example .env
```

Abra o `.env` e preencha (qualquer senha local serve):

```dotenv
MYSQL_ROOT_PASSWORD=senha_root_local
MYSQL_DATABASE=uniref
MYSQL_USER=uniref_app
MYSQL_PASSWORD=senha_app_local
```

Suba o container:

```bash
docker compose up -d
docker compose ps
```

O container `uniref-mysql` deve aparecer como `running` (ou `healthy`). O banco fica acessível em `127.0.0.1:3307`.

---

## 2. Backend

### 2.1 Baixar a chave do Firebase

No Firebase Console do projeto UniRef (`uniref-47baf`):

1.  **Project settings** → aba **Service accounts**
2. Clique em **Generate new private key**
3. Salve o arquivo JSON dentro de `backend/` com o nome **`firebase-service-account.json`**

### 2.2 Configurar e instalar

Ainda na raiz:

```bash
cd backend
cp .env.example .env
npm ci
```

Edite `backend/.env` e deixe  assim (só a senha muda):

```dotenv
PORT=3001
NODE_ENV=development

FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
ALLOWED_EMAIL_DOMAINS=@edu.unifor.br,@unifor.br

DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=uniref
DB_USER=uniref_app
DB_PASSWORD=senha_app_local
```

`DB_NAME`, `DB_USER` e `DB_PASSWORD` precisam ser iguais aos `MYSQL_*` do `.env` da raiz.

### 2.3 Criar as tabelas

```bash
npx sequelize-cli db:migrate
```

Deve rodar a migration `20261113000100-create-usuarios.cjs`. Para conferir:

```bash
npx sequelize-cli db:migrate:status
# up 20261113000100-create-usuarios.cjs
```

### 2.4 Subir a API

```bash
npm start
```

Deve aparecer:

```text
API em http://localhost:3001/api/v1
```

Teste em outro terminal (ou abra o link no navegador):

```bash
curl http://localhost:3001/api/v1/health
# {"data":{"status":"ok"}}
```

**Deixe esse terminal aberto.**

---

## 3. Frontend

Em **outro terminal**, na raiz do projeto:

```bash
cd frontend
cp .env.example .env.local
npm ci
```

No Firebase Console: **Project settings** → **General** → seu app Web → **SDK setup and configuration** → **Config**. Copie os valores para `frontend/.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=/api/v1
VITE_ALLOWED_EMAIL_DOMAINS=@edu.unifor.br,@unifor.br
```

As duas últimas linhas já vêm prontas no `.env.example`.

Suba o frontend:

```bash
npm run dev
```

Abra **http://localhost:5173**.