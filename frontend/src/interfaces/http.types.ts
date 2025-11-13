// src/types/http.types.ts

/**
 * Common API response types used across services
 * (for paginated endpoints, etc.)
 */
export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}
