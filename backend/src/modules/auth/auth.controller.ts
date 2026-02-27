import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { parseLoginDTO } from "./dtos/login.dto";
import { parseRegisterDTO } from "./dtos/register.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const dto = parseRegisterDTO(req.body);
    const result = await this.authService.register(dto);
    res.status(201).json(result);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const dto = parseLoginDTO(req.body);
    const result = await this.authService.login(dto);
    res.status(200).json(result);
  };
}

