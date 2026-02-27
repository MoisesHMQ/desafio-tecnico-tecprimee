import { AppError } from "../../../shared/errors/AppError";

export type ProductSortBy = "name" | "price" | "stock";
export type SortOrder = "asc" | "desc";

export type ListProductsDTO = {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: ProductSortBy;
  order: SortOrder;
};

const parsePositiveNumber = (value: unknown, field: string): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    throw new AppError(`Parametro '${field}' invalido.`, 422, "VALIDATION_ERROR");
  }

  return parsed;
};

export const parseListProductsDTO = (
  query: Record<string, unknown>
): ListProductsDTO => {
  const page = parsePositiveNumber(query.page, "page") ?? 1;
  const limit = parsePositiveNumber(query.limit, "limit") ?? 10;
  const minPrice = parsePositiveNumber(query.minPrice, "minPrice");
  const maxPrice = parsePositiveNumber(query.maxPrice, "maxPrice");
  const rawSearch = typeof query.search === "string" ? query.search.trim() : undefined;
  const sortBy =
    typeof query.sortBy === "string" && ["name", "price", "stock"].includes(query.sortBy)
      ? (query.sortBy as ProductSortBy)
      : "name";
  const order =
    typeof query.order === "string" && ["asc", "desc"].includes(query.order)
      ? (query.order as SortOrder)
      : "asc";

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Parametro 'page' deve ser um inteiro >= 1.", 422, "VALIDATION_ERROR");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(
      "Parametro 'limit' deve ser um inteiro entre 1 e 100.",
      422,
      "VALIDATION_ERROR"
    );
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError("minPrice nao pode ser maior que maxPrice.", 422, "VALIDATION_ERROR");
  }

  return {
    page,
    limit,
    search: rawSearch || undefined,
    minPrice,
    maxPrice,
    sortBy,
    order,
  };
};

