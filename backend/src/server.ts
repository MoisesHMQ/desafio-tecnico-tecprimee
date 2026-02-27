import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AppDataSource } from "./database/data-source";
import { setupSwagger } from "./docs/swagger";
import { authRoutes } from "./modules/auth/auth.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { productRoutes } from "./modules/products/product.routes";
import { errorHandler, notFoundHandler } from "./shared/http/error-handler";
import { authGuard } from "./shared/middlewares/auth.middleware";
import { securityHeaders } from "./shared/middlewares/security.middleware";

dotenv.config();

const app = express();
const serverPort = Number(process.env.PORT ?? 3333);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:4200";

app.disable("x-powered-by");
app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(securityHeaders);
app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({ message: "API funcionando" });
});

app.use("/auth", authRoutes);
app.use("/products", authGuard, productRoutes);
app.use("/orders", authGuard, orderRoutes);
setupSwagger(app);
app.use(notFoundHandler);
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("Banco conectado com sucesso");

    app.listen(serverPort, () => {
      console.log(`Server rodando na porta ${serverPort}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar no banco:", error);
  });
