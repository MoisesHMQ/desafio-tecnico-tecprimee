export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
}

export interface ProductListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Product[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = "Pix" | "Cartao" | "Boleto";

export interface OrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  name: string;
  email: string;
  address: string;
  paymentMethod: PaymentMethod;
  products: OrderItemPayload[];
}

export interface CreateOrderResponse {
  message: string;
  data: {
    orderId: string;
    orderNumber: number;
    createdAt: string;
  };
}

export interface OrderDetailsResponse {
  message: string;
  data: {
    id: string;
    orderNumber: number;
    customer: { name: string; email: string; address: string };
    paymentMethod: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
  };
}

export interface UserOrderListItem {
  id: string;
  orderNumber: number;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  totalItems: number;
}

export interface UserOrdersListResponse {
  message: string;
  data: UserOrderListItem[];
}
