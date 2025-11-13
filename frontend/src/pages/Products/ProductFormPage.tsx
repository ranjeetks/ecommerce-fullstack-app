// src/pages/admin/ProductFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  fetchProductById,
  updateProduct,
} from "@services/productService";

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<any>({
    name: "",
    price: 0,
    stock: 0,
    imageFile: null,
    existingImage: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [saveError, setSaveError] = useState("");

  /* ----------------------------------------------------
     ✅ Load existing product when editing
  ---------------------------------------------------- */
  useEffect(() => {
    if (id) {
      fetchProductById(Number(id)).then((data) => {
        setFormData({
          name: data.name,
          price: data.price,
          stock: data.stock,
          imageFile: null,
          existingImage: data.image_url, // ✅ backend provides absolute URL
        });
        setPreview(data.image_url?? null);
      });
    }
  }, [id]);

  /* ----------------------------------------------------
     ✅ Input change handler
  ---------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  /* ----------------------------------------------------
     ✅ File Change Handler — Image Upload & Preview
  ---------------------------------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev: any) => ({
      ...prev,
      imageFile: file,
    }));

    setPreview(URL.createObjectURL(file)); // ✅ show live preview
  };

  /* ----------------------------------------------------
     ✅ Basic Validation
  ---------------------------------------------------- */
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || isNaN(formData.price) || formData.price <= 0)
      newErrors.price = "Enter a valid price";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ----------------------------------------------------
     ✅ Form Submit Handler — Create or Update
  ---------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (id) {
        await updateProduct(Number(id), formData);
      } else {
        await createProduct(formData);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {id ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md p-2`}
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full border ${
                  errors.price ? "border-red-500" : "border-gray-300"
                } rounded-md p-2`}
              />
              {errors.price && <p className="text-red-500">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* ✅ Image Upload */}
            <div className="sm:col-span-2 mt-4">
              <label className="block text-sm font-medium mb-1">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />

              {/* ✅ Image Preview */}
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="border border-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {saving ? "Saving..." : id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Toast */}
      {saveError && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-md">
          {saveError}
        </div>
      )}
    </div>
  );
}