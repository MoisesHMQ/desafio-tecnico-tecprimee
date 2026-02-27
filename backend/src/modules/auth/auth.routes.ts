import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler";
import { rateLimit } from "../../shared/middlewares/security.middleware";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const authRoutes = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

const authRateLimit = rateLimit(10, 60 * 1000);

authRoutes.post("/register", authRateLimit, asyncHandler(authController.register));
authRoutes.post("/login", authRateLimit, asyncHandler(authController.login));

export { authRoutes };

