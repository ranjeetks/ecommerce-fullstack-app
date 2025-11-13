import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById  } from "@services/productService";
import {
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import type { Product } from "../../interfaces/product";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackImage = "/placeholder.png";
  useEffect(() => {
   if (!id) return;
   setLoading(true);
   fetchProductById(Number(id))
     .then((data) => {
       setProduct({
          ...data,
          description: data.description ?? "No description available", 
        });
      setError(null);
     })
     .catch((err) => setError(err.message))
     .finally(() => setLoading(false));
 }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
console.log("Fetched product:", product);
  if (!product) { 
    return (
      <Typography variant="h6" align="center" mt={4}>
        Product not found due to error {error}
      </Typography>
    );
  }

  return (
  <div className="flex justify-center mt-6">
    <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-6">
      {product.image_url ? (
        <img
          src={product.image_url || fallbackImage}
          alt={product.name}
          className="w-full h-72 object-cover rounded-md shadow-sm border"
          loading="lazy"
        />
      ) : (
        <div className="flex justify-center items-center h-72 bg-gray-100 rounded-md">
          <p className="text-gray-500 text-sm">No Image Available</p>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>

        <p className="text-gray-600 mb-3">{product.description}</p>

        <hr className="my-3" />

        <p className="text-xl text-blue-600 font-medium mb-2">
          ${product.price}
        </p>

        <p className="text-sm text-gray-700 mb-4">Stock: {product.stock}</p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 border border-gray-400 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md transition"
          >
            <ArrowBackIcon className="w-4 h-4" />
            Back to List
          </button>

          <button
            onClick={() => navigate(`/admin/products/${id}/edit`)}
            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md transition"
          >
            <EditIcon className="w-4 h-4" />
            Edit Product
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductDetailsPage;