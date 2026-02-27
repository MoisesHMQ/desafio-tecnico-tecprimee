import { Router } from "express";
import { ExternalProductApi } from "../../integrations/external-product.api";
import { asyncHandler } from "../../shared/http/async-handler";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

const orderRoutes = Router();
const externalProductApi = new ExternalProductApi();
const orderService = new OrderService(externalProductApi);
const orderController = new OrderController(orderService);

orderRoutes.post("/", asyncHandler(orderController.create));
orderRoutes.get("/:id", asyncHandler(orderController.getById));

export { orderRoutes };
