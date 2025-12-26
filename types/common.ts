/**
 * 공통 타입 정의
 */

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

