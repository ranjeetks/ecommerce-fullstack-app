// src/services/wishlistService.ts
import api from "@services/api";
import type { WishlistDTO } from "@interfaces/dto/wishlist-dto";
import type { ApiResponse } from "@interfaces/common/apiResponse";

const WISHLIST_BASE_URL = "/wishlist/";

export async function getWishlist(): Promise<ApiResponse<WishlistDTO>> {
  try {
    const res = await api.get<WishlistDTO>(WISHLIST_BASE_URL);
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    console.error("Error fetching wishlist:", err);
    return {
      success: false,
      data: null,
      error: err.response?.data?.detail || "Failed to fetch wishlist",
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
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error || "Failed to add to wishlist",
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
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.response?.data?.error || "Failed to remove from wishlist",
    };
  }
}