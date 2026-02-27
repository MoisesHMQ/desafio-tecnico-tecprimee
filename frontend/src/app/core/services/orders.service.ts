import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  CreateOrderPayload,
  CreateOrderResponse,
  OrderDetailsResponse,
  UserOrdersListResponse,
} from "../../shared/models";

@Injectable({ providedIn: "root" })
export class OrdersService {
  private readonly apiUrl = "http://localhost:3333";

  constructor(private readonly http: HttpClient) {}

  create(payload: CreateOrderPayload) {
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}/orders`, payload);
  }

  getById(id: string) {
    return this.http.get<OrderDetailsResponse>(`${this.apiUrl}/orders/${id}`);
  }

  listMine() {
    return this.http.get<UserOrdersListResponse>(`${this.apiUrl}/orders/me`);
  }
}
