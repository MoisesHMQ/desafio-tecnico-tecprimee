import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { AppError } from "../errors/AppError";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  if (error instanceof QueryFailedError) {
    const pgError = error as QueryFailedError & { driverError?: { code?: string } };

    if (pgError.driverError?.code === "23505") {
      res.status(409).json({
        message: "Registro duplicado.",
        code: "UNIQUE_CONSTRAINT",
      });
      return;
    }
  }

  console.error("Erro não tratado:", error);
  res.status(500).json({
    message: "Erro interno do servidor.",
    code: "INTERNAL_SERVER_ERROR",
  });
};

