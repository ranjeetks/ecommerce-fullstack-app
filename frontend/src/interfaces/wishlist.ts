// src/types/interfaces.ts

export interface ProductDetails {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product_details: ProductDetails;
}