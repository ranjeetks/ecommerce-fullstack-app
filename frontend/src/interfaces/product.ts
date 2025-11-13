export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
  updated_at?: string;

  // ✅ URL for display (returned by backend)
  image_url?: string;

  // ✅ Not returned by API but needed on frontend for editing/adding
  imageFile?: File | null;
  existingImage?: string;
}