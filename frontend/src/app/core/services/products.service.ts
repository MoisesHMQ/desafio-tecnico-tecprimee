import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductListResponse } from "../../shared/models";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private readonly apiUrl = "http://localhost:3333";

  constructor(private readonly http: HttpClient) {}

  list(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: "name" | "price" | "stock";
    order?: "asc" | "desc";
  }) {
    let httpParams = new HttpParams()
      .set("page", params.page)
      .set("limit", params.limit)
      .set("sortBy", params.sortBy ?? "name")
      .set("order", params.order ?? "asc");

    if (params.search) {
      httpParams = httpParams.set("search", params.search);
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/products`, {
      params: httpParams,
    });
  }
}

