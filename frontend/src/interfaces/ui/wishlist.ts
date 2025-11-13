// src/interfaces/ui/wishlist.ts
export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  description?: string;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
}