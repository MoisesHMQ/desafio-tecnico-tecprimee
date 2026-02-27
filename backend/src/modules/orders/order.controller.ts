import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { parseCreateOrderDTO } from "./dtos/create-order.dto";
import { parseGetOrderDTO } from "./dtos/get-order.dto";
import { AppError } from "../../shared/errors/AppError";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.authUser?.id) {
      throw new AppError("Usuario autenticado nao encontrado.", 401, "UNAUTHORIZED");
    }

    const dto = parseCreateOrderDTO(req.body);
    const result = await this.orderService.createOrder(dto, req.authUser.id);
    res.status(201).json({
      message: "Pedido criado com sucesso.",
      data: result,
    });
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const dto = parseGetOrderDTO(req.params as Record<string, unknown>);
    const result = await this.orderService.getOrderById(dto.id);
    res.status(200).json({
      message: "Pedido encontrado.",
      data: result,
    });
  };

  public listMine = async (req: Request, res: Response): Promise<void> => {
    if (!req.authUser?.id) {
      throw new AppError("Usuario autenticado nao encontrado.", 401, "UNAUTHORIZED");
    }

    const result = await this.orderService.listOrdersByUser(req.authUser.id);
    res.status(200).json({
      message: "Pedidos do usuario logado.",
      data: result,
    });
  };
}
