import { AppError } from "../../../shared/errors/AppError";

export type RegisterDTO = {
  name: string;
  email: string;
  password: string;
};

export const parseRegisterDTO = (body: unknown): RegisterDTO => {
  const payload = body as Partial<RegisterDTO>;

  const name = payload?.name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password?.trim();

  if (!name || name.length < 3) {
    throw new AppError("Nome deve ter ao menos 3 caracteres.", 422, "VALIDATION_ERROR");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("E-mail inválido.", 422, "VALIDATION_ERROR");
  }

  if (!password || password.length < 6) {
    throw new AppError("Senha deve ter ao menos 6 caracteres.", 422, "VALIDATION_ERROR");
  }

  return { name, email, password };
};

