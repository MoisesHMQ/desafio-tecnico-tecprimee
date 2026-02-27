import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { parseListProductsDTO } from "./dtos/list-products.dto";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  public list = async (req: Request, res: Response): Promise<void> => {
    const dto = parseListProductsDTO(req.query as Record<string, unknown>);
    const result = await this.productService.listProducts(dto);
    res.status(200).json(result);
  };
}
