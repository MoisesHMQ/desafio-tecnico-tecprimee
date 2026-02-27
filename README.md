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

## Como Rodar (Docker - Recomendado)
Na raiz do projeto:

```bash
docker compose up -d --build
```

Acessos:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3333`
- Swagger: `http://localhost:3333/api-docs`
- PostgreSQL: `localhost:5433`

Parar:

```bash
docker compose down
```

## Como Rodar Localmente (sem Docker)

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
No backend:

```bash
cd backend
npm run test:e2e
```

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
1. Testes unitarios por modulo (services/DTOs).
2. Observabilidade (logs estruturados e tracing).
3. Controle transacional de estoque no pedido.
4. Controle transacional de estoque no pedido.


