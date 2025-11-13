import type { Product } from "../interfaces/product";
import api from "@services/api";
import type { PaginatedResponse } from "../interfaces/http.types";

// ✅ Convert product data to FormData
function toFormData(data: Partial<Omit<Product, "id">>): FormData {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name);
  if (data.description !== undefined) formData.append("description", data.description);
  if (data.price !== undefined) formData.append("price", String(data.price));
  if (data.stock !== undefined) formData.append("stock", String(data.stock));

  // ✅ Image upload
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  return formData;
}

// ✅ Fetch all products
export async function getProducts(params?: {
  search?: string;
  ordering?: string;
}): Promise<PaginatedResponse<Product> | Product[]> {
  const res = await api.get("products/", { params });
  return res.data;
}

// ✅ Fetch by ID
export async function fetchProductById(id: number): Promise<Product> {
  const res = await api.get(`products/${id}/`);
  return res.data;
}

// ✅ Create product WITH image support
export async function createProduct(data: Partial<Omit<Product, "id">>): Promise<Product> {
  const formData = toFormData(data);
  const res = await api.post("products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Update product WITH image support
export async function updateProduct(
  id: number,
  data: Partial<Omit<Product, "id">>
): Promise<Product> {
  const formData = toFormData(data);
  const res = await api.put(`products/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Delete
export async function deleteProduct(id: number) {
  await api.delete(`products/${id}/`);
}