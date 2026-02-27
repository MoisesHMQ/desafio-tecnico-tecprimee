import { PaymentMethod } from "../../../database/entities/Order";
import { AppError } from "../../../shared/errors/AppError";

type CreateOrderItemDTO = {
  productId: number;
  quantity: number;
};

export type CreateOrderDTO = {
  name: string;
  email: string;
  address: string;
  paymentMethod: PaymentMethod;
  products: CreateOrderItemDTO[];
};

const normalizePaymentMethod = (value: string): PaymentMethod | null => {
  const normalized = value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "PIX") {
    return PaymentMethod.PIX;
  }

  if (normalized === "CARTAO" || normalized === "CARTAO DE CREDITO") {
    return PaymentMethod.CARTAO;
  }

  if (normalized === "BOLETO") {
    return PaymentMethod.BOLETO;
  }

  return null;
};

export const parseCreateOrderDTO = (body: unknown): CreateOrderDTO => {
  const payload = body as Partial<CreateOrderDTO>;
  const name = payload?.name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const address = payload?.address?.trim();
  const paymentMethodRaw =
    typeof payload?.paymentMethod === "string" ? payload.paymentMethod : "";
  const paymentMethod = normalizePaymentMethod(paymentMethodRaw);

  if (!name || name.length < 3) {
    throw new AppError("Nome deve ter ao menos 3 caracteres.", 422, "VALIDATION_ERROR");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("E-mail invalido.", 422, "VALIDATION_ERROR");
  }

  if (!address || address.length < 5) {
    throw new AppError("Endereco deve ter ao menos 5 caracteres.", 422, "VALIDATION_ERROR");
  }

  if (!paymentMethod) {
    throw new AppError(
      "Forma de pagamento invalida. Use Pix, Cartao ou Boleto.",
      422,
      "VALIDATION_ERROR"
    );
  }

  if (!Array.isArray(payload?.products) || payload.products.length === 0) {
    throw new AppError("Lista de produtos e obrigatoria.", 422, "VALIDATION_ERROR");
  }

  const products = payload.products.map((item, index) => {
    const productId = Number((item as CreateOrderItemDTO).productId);
    const quantity = Number((item as CreateOrderItemDTO).quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new AppError(
        `productId invalido no item ${index + 1}.`,
        422,
        "VALIDATION_ERROR"
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError(
        `quantity invalido no item ${index + 1}.`,
        422,
        "VALIDATION_ERROR"
      );
    }

    return { productId, quantity };
  });

  return { name, email, address, paymentMethod, products };
};

