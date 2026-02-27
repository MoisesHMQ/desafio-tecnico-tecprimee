import { Router } from "express";
import { ExternalProductApi } from "../../integrations/external-product.api";
import { asyncHandler } from "../../shared/http/async-handler";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";

const productRoutes = Router();
const externalProductApi = new ExternalProductApi();
const productService = new ProductService(externalProductApi);
const productController = new ProductController(productService);

productRoutes.get("/", asyncHandler(productController.list));

export { productRoutes };
