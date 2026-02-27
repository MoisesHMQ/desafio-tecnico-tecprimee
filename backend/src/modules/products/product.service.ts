import {
  ListProductsDTO,
  ProductSortBy,
  SortOrder,
} from "./dtos/list-products.dto";
import { DummyProduct, ExternalProductApi } from "../../integrations/external-product.api";

type ProductOutput = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
};

type ListProductsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ProductOutput[];
};

export class ProductService {
  constructor(private readonly externalProductApi: ExternalProductApi) {}

  public async listProducts(params: ListProductsDTO): Promise<ListProductsResponse> {
    const externalProducts = await this.externalProductApi.getAllProducts();
    const mappedProducts = externalProducts.map(this.mapProduct);
    const filteredProducts = this.applyFilters(mappedProducts, params);
    const sortedProducts = this.applySort(filteredProducts, params.sortBy, params.order);

    const total = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / params.limit));
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = sortedProducts.slice(start, end);

    return {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      data,
    };
  }

  private mapProduct(product: DummyProduct): ProductOutput {
    return {
      id: product.id,
      nome: product.title,
      descricao: product.description,
      preco: Number(product.price.toFixed(2)),
      estoque: Number.isInteger(product.stock) ? product.stock : 10,
      imagem: product.thumbnail,
    };
  }

  private applyFilters(products: ProductOutput[], params: ListProductsDTO): ProductOutput[] {
    return products.filter((product) => {
      const matchesSearch =
        !params.search ||
        product.nome.toLowerCase().includes(params.search.toLowerCase()) ||
        product.descricao.toLowerCase().includes(params.search.toLowerCase());
      const matchesMinPrice = params.minPrice === undefined || product.preco >= params.minPrice;
      const matchesMaxPrice = params.maxPrice === undefined || product.preco <= params.maxPrice;

      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });
  }

  private applySort(
    products: ProductOutput[],
    sortBy: ProductSortBy,
    order: SortOrder
  ): ProductOutput[] {
    const direction = order === "asc" ? 1 : -1;

    return [...products].sort((a, b) => {
      if (sortBy === "price") {
        return (a.preco - b.preco) * direction;
      }

      if (sortBy === "stock") {
        return (a.estoque - b.estoque) * direction;
      }

      return a.nome.localeCompare(b.nome) * direction;
    });
  }
}

export type { ListProductsResponse, ProductOutput };
