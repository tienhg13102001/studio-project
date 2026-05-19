import type { Response } from "express";
import type { ApiPaginatedResponse, ApiResponse, PaginatedData } from "../types/index.ts";

export const sendSuccess = <T>(res: Response, data: T, status = 200): void => {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
};

export const sendError = (res: Response, error: string, status = 400): void => {
  const body: ApiResponse<never> = { success: false, error };
  res.status(status).json(body);
};

export const sendPaginated = <T>(
  res: Response,
  allItems: T[],
  page: number,
  limit: number,
): void => {
  const total = allItems.length;
  const totalPages = Math.ceil(total / limit);
  const items = allItems.slice((page - 1) * limit, page * limit);

  const data: PaginatedData<T> = {
    items,
    pagination: { page, limit, total, totalPages },
  };
  const body: ApiPaginatedResponse<T> = { success: true, data };
  res.json(body);
};

// Helper: parse & validate page/limit from query string
export const parsePagination = (
  query: Record<string, unknown>,
  defaultLimit = 10,
): { page: number; limit: number } | null => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? defaultLimit);
  if (!Number.isInteger(page) || page < 1) return null;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return null;
  return { page, limit };
};
