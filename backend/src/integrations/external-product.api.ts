import { AppError } from "../shared/errors/AppError";

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  thumbnail: string;
};

type DummyProductResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

export class ExternalProductApi {
  private readonly baseUrl = "https://dummyjson.com";
  private readonly requestLimit = 100;

  public async getAllProducts(): Promise<DummyProduct[]> {
    const firstPage = await this.fetchPage(0, this.requestLimit);
    const products = [...firstPage.products];

    if (firstPage.total <= firstPage.products.length) {
      return products;
    }

    for (let skip = firstPage.products.length; skip < firstPage.total; skip += this.requestLimit) {
      const page = await this.fetchPage(skip, this.requestLimit);
      products.push(...page.products);
    }

    return products;
  }

  private async fetchPage(skip: number, limit: number): Promise<DummyProductResponse> {
    const url = `${this.baseUrl}/products?limit=${limit}&skip=${skip}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new AppError("Falha ao consultar API externa de produtos.", 502, "EXTERNAL_API_ERROR");
      }

      const data = (await response.json()) as DummyProductResponse;

      if (!Array.isArray(data.products) || typeof data.total !== "number") {
        throw new AppError(
          "Resposta da API externa em formato invalido.",
          502,
          "EXTERNAL_API_INVALID_RESPONSE"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Nao foi possivel consultar a API externa de produtos.",
        502,
        "EXTERNAL_API_UNAVAILABLE"
      );
    }
  }
}

export type { DummyProduct };
