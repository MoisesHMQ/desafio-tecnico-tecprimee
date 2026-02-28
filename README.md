# Desafio Tecnico Tecprime
Mini sistema de compras online com:
- Backend em Node.js + TypeScript + TypeORM
- Frontend em Angular (arquitetura modular)
- Banco relacional PostgreSQL
- Docker/Docker Compose para execucao integrada

## Visao Geral
O sistema entrega os requisitos principais do desafio:
- Autenticacao (`register/login`) com JWT
- Integracao com API externa de produtos (`dummyjson`)
- Criacao e consulta de pedidos
- Listagem de pedidos do usuario autenticado
- Frontend com fluxo completo: login, produtos, carrinho, checkout e confirmacao

## Arquitetura

### Backend (`/backend`)
Arquitetura em camadas por modulo:
- `modules/*`: `controller`, `service`, `dto`, `routes`
- `database/entities`: entidades TypeORM
- `shared`: middlewares, tratamento de erro, utilitarios
- `integrations`: clientes externos (ex.: API de produtos)

Padroes usados:
- Controller sem regra de negocio
- DTO para validacao e normalizacao de entrada
- Service com regras e orquestracao
- `AppError` + middleware global para resposta de erro padronizada
- JWT guard centralizado para rotas protegidas

### Frontend (`/frontend`)
Arquitetura modular por feature:
- `features/auth`
- `features/products`
- `features/cart`
- `features/checkout`
- `features/confirmation`
- `features/orders`

Camadas de suporte:
- `core`: servicos HTTP, guard e interceptor JWT
- `shared`: modelos, layout e estado do carrinho

## Decisoes Arquiteturais
1. Separacao clara de responsabilidades para facilitar manutencao e evolucao.
2. JWT no backend com validacao de usuario por request para seguranca basica.
3. Endpoint de produtos desacoplado da API externa via camada `integrations`.
4. Pedidos vinculados ao usuario autenticado (`user_id`) para permitir `GET /orders/me`.
5. E2E simples sem framework pesado para validar fluxo real HTTP + persistencia.
6. SQLite em testes E2E para execucao isolada e rapida; PostgreSQL para runtime.

## Como Executar o Projeto
Pre-requisitos:
- Docker e Docker Compose
- Git

### Clonagem do Repositorio
```bash
git clone https://github.com/MoisesHMQ/desafio-tecnico-tecprimee.git
cd desafio-tecnico-tecprimee
```

### Configuracao do Ambiente (.env)
Para execucao via Docker Compose, este projeto ja possui configuracao padrao no `docker-compose.yml`.

Se quiser customizar variaveis do backend, crie `backend/.env` com:

```env
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tecprime_db
DB_USER=postgres
DB_PASS=123456
PORT=3333
JWT_SECRET=UmaSenhaSuperSecretaECompridaParaOSeuTokenJWT2026
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
```

### Inicializacao via Docker Compose
Execute o comando para realizar o build das imagens e subir os servicos:

```bash
docker compose up --build -d
```

### Acesso
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3333`
- Backend Swagger: `http://localhost:3333/api-docs`

## Como Rodar Localmente (sem Docker)
Pre-requisitos:
- Node.js 20+
- npm
- PostgreSQL rodando localmente (porta 5433 mapeada para o banco do projeto)

### Clonagem do Repositorio
```bash
git clone https://github.com/MoisesHMQ/desafio-tecnico-tecprimee.git
cd desafio-tecnico-tecprimee
```

### Configuracao do Ambiente Local (`backend/.env`)
Para rodar sem Docker, use:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=tecprime_db
DB_USER=postgres
DB_PASS=123456
PORT=3333
JWT_SECRET=UmaSenhaSuperSecretaECompridaParaOSeuTokenJWT2026
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Teste E2E
O E2E do projeto fica no backend (`npm run test:e2e`) e usa SQLite isolado para o teste.

### Opcao 1: Rodar localmente (sem Docker)
```bash
cd backend
npm install
npm run test:e2e
```

### Opcao 2: Rodar via Docker (recomendado para ambiente limpo)
Linux/macOS:
```bash
docker run --rm -t \
  -v "$(pwd)/backend:/app" \
  -w /app \
  node:20-slim \
  sh -c "npm ci && npm run test:e2e"
```

PowerShell (Windows):
```powershell
docker run --rm -t `
  -v "${PWD}/backend:/app" `
  -w /app `
  node:20-slim `
  sh -c "npm ci && npm run test:e2e"
```

Observacao:
- O E2E nao depende do Postgres do `docker compose`, porque ele sobe a API em modo de teste com SQLite.
- O container `backend` do `docker-compose.yml` eh imagem de runtime (producao), entao para E2E use o comando acima com `node:20-slim`.

Esse teste:
- sobe a API compilada
- executa requisicoes HTTP reais
- valida autenticacao, produtos e pedidos
- verifica persistencia em banco SQLite de teste

## Endpoints Principais

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Products (protegido por JWT)
- `GET /products`
  - paginacao: `page`, `limit`, `total`, `totalPages`
  - filtro: `search`, `minPrice`, `maxPrice`
  - ordenacao: `sortBy`, `order`

### Orders (protegido por JWT)
- `POST /orders`
- `GET /orders/:id`
- `GET /orders/me`

## Variaveis de Ambiente (Backend)
Exemplo em `backend/.env`:
- `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT`
- `FRONTEND_URL`

## Melhorias Futuras
1. Melhorar cobertura de testes (unitario, integracao e E2E).
2. Adicionar controle transacional de estoque.
3. Implementar logs estruturados e metricas basicas.
4. Reforcar seguranca com refresh token e politicas por ambiente.
5. Melhorar tratamento de erros e estados de loading no frontend.
6. Criar pipeline CI/CD com lint, testes e build automatizados.
