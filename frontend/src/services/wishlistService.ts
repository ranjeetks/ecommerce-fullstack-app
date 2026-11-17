// src/services/wishlistService.ts
import axios from "axios";
import api from "@services/api";
import type { WishlistDTO } from "@interfaces/dto/wishlist-dto";
import type { ApiResponse } from "@interfaces/common/apiResponse";

const WISHLIST_BASE_URL = "/wishlist/";

function apiErrorField(err: unknown, field: "detail" | "error"): string | undefined {
  return axios.isAxiosError<{ detail?: string; error?: string }>(err) ? err.response?.data?.[field] : undefined;
}

export async function getWishlist(): Promise<ApiResponse<WishlistDTO>> {
  try {
    const res = await api.get<WishlistDTO>(WISHLIST_BASE_URL);
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return {
      success: false,
      data: null,
      error: apiErrorField(err, "detail") || "Failed to fetch wishlist",
    };
  }
}

export async function addToWishlist(productId: number): Promise<ApiResponse<null>> {
  try {
    const res = await api.post(`${WISHLIST_BASE_URL}add/${productId}/`);
    return {
      success: true,
      data: res.data ?? null,   // ✅ ensure `data` exists
      message: res.data?.message || "Product added to wishlist",
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: apiErrorField(err, "error") || "Failed to add to wishlist",
    };
  }
}

export async function removeFromWishlist(productId: number): Promise<ApiResponse<null>> {
  try {
    const res = await api.delete(`${WISHLIST_BASE_URL}remove/${productId}/`);
    return {
      success: true,
      data: res.data ?? null,   // ✅ ensure `data` exists
      message: res.data?.message || "Product removed from wishlist",
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: apiErrorField(err, "error") || "Failed to remove from wishlist",
    };
  }
}