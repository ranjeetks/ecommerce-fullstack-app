// src/businessLogic/wishlistBusinessLogic.ts
import type { Wishlist } from "@interfaces/ui/wishlist";

/**
 * ✅ Checks if a product already exists in the wishlist.
 */
export function isProductInWishlist(
  wishlist: Wishlist | null,
  productId: number
): boolean {
  if (!wishlist || !wishlist.items) return false;
  return wishlist.items.some((item) => item.productId === productId);
}

/**
 * ✅ Handles frontend validation for adding product to wishlist.
 * Returns an error message if invalid, otherwise null.
 */
export function validateWishlistAddition(
  wishlist: Wishlist | null,
  productId: number
): string | null {
  if (isProductInWishlist(wishlist, productId)) {
    return "⚠️ This product is already in your wishlist.";
  }
  return null;
}