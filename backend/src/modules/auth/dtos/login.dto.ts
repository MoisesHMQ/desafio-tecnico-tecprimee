import { AppError } from "../../../shared/errors/AppError";

export type LoginDTO = {
  email: string;
  password: string;
};

export const parseLoginDTO = (body: unknown): LoginDTO => {
  const payload = body as Partial<LoginDTO>;

  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password?.trim();

  if (!email || !password) {
    throw new AppError("E-mail e senha são obrigatórios.", 422, "VALIDATION_ERROR");
  }

  return { email, password };
};

