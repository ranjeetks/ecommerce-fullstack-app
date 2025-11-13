// src/logic/wishlistLogic.ts
import type { WishlistItem } from "@interfaces/wishlist";
import { addToWishlist, removeFromWishlist } from "@services/wishlistService";

/**
 * Check if a product already exists in wishlist.
 */
export const isProductInWishlist = (items: WishlistItem[], productId: number): boolean =>
  items.some((item) => item.product_id === productId);

/**
 * Add product to wishlist with frontend validation.
 * Returns a message string to show on UI.
 */
export const handleAddToWishlist = async (
  productId: number,
  items: WishlistItem[],
  setMessage: (msg: string) => void,
  fetchWishlist: () => void,
  setActionLoading: (val: boolean) => void
): Promise<void> => {
  if (isProductInWishlist(items, productId)) {
    setMessage("⚠️ This product is already in your wishlist.");
    return;
  }

  setActionLoading(true);
  setMessage("");
  const res = await addToWishlist(productId);
  setActionLoading(false);

  if (res.success) {
    setMessage("✅ Product added to wishlist!");
    fetchWishlist();
  } else {
    setMessage(res.error || "❌ Failed to add product to wishlist.");
  }
};

/**
 * Remove product from wishlist and handle UI feedback.
 */
export const handleRemoveFromWishlist = async (
  productId: number,
  fetchWishlist: () => void,
  setMessage: (msg: string) => void,
  setActionLoading: (val: boolean) => void
): Promise<void> => {
  setActionLoading(true);
  const res = await removeFromWishlist(productId);
  setActionLoading(false);

  if (res.success) {
    setMessage("✅ Product removed from wishlist!");
    fetchWishlist();
  } else {
    setMessage(res.error || "❌ Failed to remove product from wishlist.");
  }
};