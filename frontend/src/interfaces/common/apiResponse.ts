// src/interfaces/common/apiResponse.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;      // ✅ always present, never undefined
  message?: string;
  error?: string;
}