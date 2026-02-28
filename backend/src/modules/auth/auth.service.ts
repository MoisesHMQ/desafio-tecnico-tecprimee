import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { User } from "../../database/entities/User";
import { AppError } from "../../shared/errors/AppError";
import { LoginDTO } from "./dtos/login.dto";
import { RegisterDTO } from "./dtos/register.dto";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export class AuthService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered.", 409, "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);
    const token = this.generateToken(savedUser);

    return {
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  public async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("LOWER(user.email) = LOWER(:email)", { email: data.email })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!validPassword) {
      throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS");
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError(
        "JWT_SECRET não configurado no ambiente.",
        500,
        "JWT_SECRET_MISSING"
      );
    }

    const expiresIn = process.env.JWT_EXPIRES_IN ?? "1d";

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      secret as Secret,
      { expiresIn } as SignOptions
    );
  }
}

