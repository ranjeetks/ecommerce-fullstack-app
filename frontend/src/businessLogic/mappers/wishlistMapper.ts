// src/businessLogic/mappers/wishlistMapper.ts
import type { WishlistDTO, WishlistItemDTO } from "@interfaces/dto/wishlist-dto";
import type { Wishlist, WishlistItem } from "@interfaces/ui/wishlist";

export function mapWishlistItem(dto: WishlistItemDTO): WishlistItem {
  // Narrow product safely and preserve its type
  const product = dto.product;

  return {
    id: dto.id,
    productId: dto.product_id,
    name: product?.name ?? "Unknown Product",
    price: Number(product?.price ?? 0),
    imageUrl: product?.image_url ?? "/media/products/default.jpg",
    stock: product?.stock ?? 0,
    description: product?.description ?? "",
  };
}

export function mapWishlist(dto: WishlistDTO): Wishlist {
  return {
    id: dto.id,
    items: (dto.items || []).map(mapWishlistItem),
  };
}