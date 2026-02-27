import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Tecprime Challenge API",
    version: "1.0.0",
    description: "Documentacao da API de compras online.",
  },
  servers: [
    {
      url: "http://localhost:3333",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health", description: "Status da API" },
    { name: "Auth", description: "Autenticacao e usuarios" },
    { name: "Products", description: "Consulta de produtos" },
    { name: "Orders", description: "Criacao e consulta de pedidos" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Joao Silva" },
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: { type: "string", example: "123456" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: { type: "string", example: "123456" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          code: { type: "string" },
          details: {},
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "number", example: 1 },
          nome: { type: "string", example: "Essence Mascara Lash Princess" },
          descricao: { type: "string", example: "The Essence Mascara Lash Princess is a popular mascara..." },
          preco: { type: "number", example: 9.99 },
          estoque: { type: "number", example: 5 },
          imagem: { type: "string", example: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp" },
        },
      },
      ProductsListResponse: {
        type: "object",
        properties: {
          page: { type: "number", example: 1 },
          limit: { type: "number", example: 10 },
          total: { type: "number", example: 194 },
          totalPages: { type: "number", example: 20 },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["name", "email", "address", "paymentMethod", "products"],
        properties: {
          name: { type: "string", example: "Maria Souza" },
          email: { type: "string", format: "email", example: "maria@email.com" },
          address: { type: "string", example: "Rua A, 123 - Centro" },
          paymentMethod: { type: "string", enum: ["Pix", "Cartao", "Boleto"], example: "Pix" },
          products: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "number", example: 1 },
                quantity: { type: "number", example: 2 },
              },
            },
          },
        },
      },
      CreateOrderResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Pedido criado com sucesso." },
          data: {
            type: "object",
            properties: {
              orderId: { type: "string", format: "uuid" },
              orderNumber: { type: "number", example: 1001 },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      OrderDetailsResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Pedido encontrado." },
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              orderNumber: { type: "number", example: 1001 },
              customer: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  address: { type: "string" },
                },
              },
              paymentMethod: { type: "string", example: "PIX" },
              totalAmount: { type: "number", example: 199.98 },
              createdAt: { type: "string", format: "date-time" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    productId: { type: "number" },
                    productName: { type: "string" },
                    quantity: { type: "number" },
                    price: { type: "number" },
                    subtotal: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
      UserOrdersListResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Pedidos do usuario logado." },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                orderNumber: { type: "number", example: 1002 },
                paymentMethod: { type: "string", example: "PIX" },
                totalAmount: { type: "number", example: 120.5 },
                createdAt: { type: "string", format: "date-time" },
                totalItems: { type: "number", example: 3 },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Verifica se a API esta ativa",
        responses: {
          "200": {
            description: "API funcionando",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registra um novo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "409": {
            description: "E-mail ja cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Erro de validacao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Realiza login e devolve JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login efetuado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Credenciais invalidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Erro de validacao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Lista produtos normalizados da API externa",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Filtra por nome ou descricao",
          },
          {
            in: "query",
            name: "minPrice",
            schema: { type: "number", minimum: 0 },
          },
          {
            in: "query",
            name: "maxPrice",
            schema: { type: "number", minimum: 0 },
          },
          {
            in: "query",
            name: "sortBy",
            schema: { type: "string", enum: ["name", "price", "stock"], default: "name" },
          },
          {
            in: "query",
            name: "order",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
        ],
        responses: {
          "200": {
            description: "Lista de produtos com paginacao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductsListResponse" },
              },
            },
          },
          "422": {
            description: "Erro de validacao nos parametros",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "502": {
            description: "Falha ao consultar API externa",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Cria um novo pedido",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Pedido criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateOrderResponse" },
              },
            },
          },
          "404": {
            description: "Produto nao encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Erro de validacao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/orders/me": {
      get: {
        tags: ["Orders"],
        summary: "Lista os pedidos do usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de pedidos do usuario logado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserOrdersListResponse" },
              },
            },
          },
          "401": {
            description: "Nao autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Busca pedido por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Pedido encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderDetailsResponse" },
              },
            },
          },
          "404": {
            description: "Pedido nao encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
