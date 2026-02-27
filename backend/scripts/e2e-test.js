const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "..");
const envTestPath = path.resolve(projectRoot, ".env.test");
const envDefaultPath = path.resolve(projectRoot, ".env");
dotenv.config({ path: fs.existsSync(envTestPath) ? envTestPath : envDefaultPath });

const testPort = Number(process.env.E2E_PORT || 3334);
const baseUrl = `http://127.0.0.1:${testPort}`;
const sqlitePath = path.resolve(
  projectRoot,
  process.env.DB_SQLITE_PATH || path.join("tmp", "test.sqlite")
);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const request = async (pathname, options = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { status: response.status, data };
};

const getSqliteCounts = async () => {
  const db = new sqlite3.Database(sqlitePath);
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(*) FROM order_items) AS order_items
  `;

  const row = await new Promise((resolve, reject) => {
    db.get(query, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });

  await new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  return row;
};

const waitForServer = async (timeoutMs = 20000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) {
        return;
      }
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error("Servidor nao ficou pronto no tempo esperado.");
};

const startServer = () => {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

  const child = spawn("node", ["dist/server.js"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(testPort),
      DB_TYPE: "sqlite",
      DB_SQLITE_PATH: sqlitePath,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[api] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[api] ${chunk}`));

  return child;
};

const stopServer = async (child) => {
  if (!child || child.killed) return;

  child.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!child.killed) {
    child.kill("SIGKILL");
  }
};

const removeDist = () => {
  fs.rmSync(path.resolve(projectRoot, "dist"), { recursive: true, force: true });
};

const removeSqlite = () => {
  fs.rmSync(sqlitePath, { force: true });
};

const run = async () => {
  let server;

  try {
    removeSqlite();
    server = startServer();
    await waitForServer();

    const unauthorizedProducts = await request("/products", { method: "GET" });
    assert(unauthorizedProducts.status === 401, "Produtos sem token deveria retornar 401.");

    const uniqueEmail = `e2e_${Date.now()}@mail.com`;

    const register = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "E2E User",
        email: uniqueEmail,
        password: "123456",
      }),
    });

    assert(register.status === 201, "Falha no registro de usuario.");
    assert(register.data?.token, "Token nao retornado no registro.");
    const token = register.data.token;

    const myOrdersBefore = await request("/orders/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert(myOrdersBefore.status === 200, "Falha ao consultar /orders/me antes da compra.");
    assert(Array.isArray(myOrdersBefore.data?.data), "Resposta de /orders/me invalida.");
    assert(myOrdersBefore.data.data.length === 0, "Usuario novo deveria iniciar sem pedidos.");

    const products = await request("/products?page=1&limit=5&sortBy=price&order=asc", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert(products.status === 200, "Falha na listagem de produtos.");
    assert(Array.isArray(products.data?.data), "Resposta de produtos invalida.");
    assert(typeof products.data?.total === "number", "Campo total nao retornado.");
    assert(typeof products.data?.totalPages === "number", "Campo totalPages nao retornado.");
    assert(products.data.data.length > 0, "Nenhum produto retornado para o teste.");

    const firstProduct = products.data.data[0];

    const createOrder = await request("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: "Cliente E2E",
        email: "cliente.e2e@mail.com",
        address: "Rua Teste, 123",
        paymentMethod: "Pix",
        products: [{ productId: firstProduct.id, quantity: 2 }],
      }),
    });

    assert(createOrder.status === 201, "Falha ao criar pedido.");
    assert(createOrder.data?.data?.orderId, "orderId nao retornado.");
    assert(createOrder.data?.data?.orderNumber, "orderNumber nao retornado.");

    const orderId = createOrder.data.data.orderId;
    const orderNumber = createOrder.data.data.orderNumber;

    const getOrder = await request(`/orders/${orderId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert(getOrder.status === 200, "Falha ao consultar pedido.");
    assert(getOrder.data?.data?.id === orderId, "ID do pedido retornado nao confere.");
    assert(Array.isArray(getOrder.data?.data?.items), "Itens do pedido nao retornados.");

    const myOrdersAfter = await request("/orders/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    assert(myOrdersAfter.status === 200, "Falha ao consultar /orders/me apos compra.");
    assert(myOrdersAfter.data?.data?.length === 1, "Usuario deveria possuir 1 pedido apos compra.");
    assert(
      myOrdersAfter.data.data[0].id === orderId,
      "Pedido criado nao apareceu em /orders/me."
    );
    assert(
      myOrdersAfter.data.data[0].orderNumber === orderNumber,
      "orderNumber retornado em /orders/me nao confere."
    );
    assert(
      myOrdersAfter.data.data[0].totalItems === 2,
      "totalItems em /orders/me nao confere."
    );

    const counts = await getSqliteCounts();
    assert(counts.users >= 1, "Usuario nao persistido no banco.");
    assert(counts.orders >= 1, "Pedido nao persistido no banco.");
    assert(counts.order_items >= 1, "Itens do pedido nao persistidos no banco.");

    console.log("Teste E2E concluido com sucesso.");
  } finally {
    await stopServer(server);
    removeDist();
    removeSqlite();
  }
};

run().catch((error) => {
  console.error("Teste E2E falhou:", error.message);
  process.exit(1);
});
