import { Repository } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { Order } from "../../database/entities/Order";
import { OrderItem } from "../../database/entities/OrderItem";
import { AppError } from "../../shared/errors/AppError";
import { ExternalProductApi } from "../../integrations/external-product.api";
import { CreateOrderDTO } from "./dtos/create-order.dto";

type CreateOrderResponse = {
  orderId: string;
  orderNumber: number;
  createdAt: Date;
};

type OrderDetailsResponse = {
  id: string;
  orderNumber: number;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  paymentMethod: string;
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
};

type UserOrderListItem = {
  id: string;
  orderNumber: number;
  paymentMethod: string;
  totalAmount: number;
  createdAt: Date;
  totalItems: number;
};

export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly orderItemRepository: Repository<OrderItem>;

  constructor(private readonly externalProductApi: ExternalProductApi) {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
  }

  public async createOrder(
    data: CreateOrderDTO,
    userId: string
  ): Promise<CreateOrderResponse> {
    const externalProducts = await this.externalProductApi.getAllProducts();
    const productsById = new Map(externalProducts.map((product) => [product.id, product]));

    const items = data.products.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new AppError(`Produto ${item.productId} nao encontrado.`, 404, "PRODUCT_NOT_FOUND");
      }

      return this.orderItemRepository.create({
        productId: product.id,
        productName: product.title,
        price: Number(product.price.toFixed(2)),
        quantity: item.quantity,
      });
    });

    const totalAmount = Number(
      items
        .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
        .toFixed(2)
    );

    const maxResult = await this.orderRepository
      .createQueryBuilder("order")
      .select("MAX(order.orderNumber)", "max")
      .getRawOne<{ max: string | null }>();
    const nextOrderNumber = Number(maxResult?.max ?? 0) + 1;

    const order = this.orderRepository.create({
      orderNumber: nextOrderNumber,
      customerName: data.name,
      email: data.email,
      address: data.address,
      paymentMethod: data.paymentMethod,
      totalAmount,
      items,
      user_id: userId,
    });

    const savedOrder = await this.orderRepository.save(order);

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      createdAt: savedOrder.createdAt,
    };
  }

  public async getOrderById(id: string): Promise<OrderDetailsResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { items: true },
    });

    if (!order) {
      throw new AppError("Pedido nao encontrado.", 404, "ORDER_NOT_FOUND");
    }

    const items = order.items.map((item) => {
      const price = Number(item.price);
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price,
        subtotal: Number((price * item.quantity).toFixed(2)),
      };
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerName,
        email: order.email,
        address: order.address,
      },
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items,
    };
  }

  public async listOrdersByUser(userId: string): Promise<UserOrderListItem[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      relations: { items: true },
      order: { createdAt: "DESC" },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
  }
}

export type { CreateOrderResponse, OrderDetailsResponse, UserOrderListItem };
