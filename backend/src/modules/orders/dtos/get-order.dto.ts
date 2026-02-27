import { AppError } from "../../../shared/errors/AppError";

export type GetOrderDTO = {
  id: string;
};

export const parseGetOrderDTO = (params: Record<string, unknown>): GetOrderDTO => {
  const id = typeof params.id === "string" ? params.id.trim() : "";

  if (!id) {
    throw new AppError("ID do pedido e obrigatorio.", 422, "VALIDATION_ERROR");
  }

  return { id };
};

