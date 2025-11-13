// src/interfaces/dto/wishlist-dto.ts
export interface WishlistItemDTO {
  id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    price: string;
    stock: number;
    description?: string;
    image_url?: string;
  } | null;
}

export interface WishlistDTO {
  id: number;
  items: WishlistItemDTO[];
  total_items: number;
}