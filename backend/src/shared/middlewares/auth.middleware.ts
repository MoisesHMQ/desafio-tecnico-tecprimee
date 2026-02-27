import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../../database/data-source";
import { User } from "../../database/entities/User";
import { AppError } from "../errors/AppError";

type TokenPayload = JwtPayload & {
  sub?: string;
  email?: string;
};

export const authGuard = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token nao informado.", 401, "TOKEN_MISSING");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Formato do token invalido. Use: Bearer <token>.", 401, "TOKEN_INVALID");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET nao configurado.", 500, "JWT_SECRET_MISSING");
  }

  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw new AppError("Token invalido ou expirado.", 401, "TOKEN_INVALID");
  }

  const userId = typeof payload.sub === "string" ? payload.sub : undefined;
  const userEmail = typeof payload.email === "string" ? payload.email : undefined;

  if (!userId || !userEmail) {
    throw new AppError("Token invalido.", 401, "TOKEN_INVALID");
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId, email: userEmail },
  });

  if (!user) {
    throw new AppError("Usuario do token nao encontrado.", 401, "TOKEN_USER_NOT_FOUND");
  }

  req.authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  next();
};

