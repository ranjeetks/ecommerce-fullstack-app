// src/pages/admin/EditProduct.tsx
import { useState, useEffect } from "react";
import api from "@services/api";

export default function EditProduct({ productId }: { productId: number }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [stock, setStock] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${productId}/`);
      setName(data.name);
      setPrice(String(data.price));
      setStock(data.stock);
      setImagePreview(data.image_url || data.image || null);
    })();
  }, [productId]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (f) setImagePreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("stock", String(stock));
      if (imageFile) fd.append("image", imageFile);     // ✅ optional

      await api.patch(`/products/${productId}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product updated");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* name/price/stock inputs … */}
      <div>
        <label className="block font-medium mb-1">Image</label>
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="h-24 mb-2 rounded" />
        )}
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <button disabled={loading} className="btn btn-primary">
        {loading ? "Saving…" : "Update"}
      </button>
    </form>
  );
}