import { useEffect, useState } from "react";
import api from "@services/api";
import { addToCart } from "@services/cartService";
import { addToWishlist, getWishlist } from "@services/wishlistService";
import { logger } from "@utils/logger";
import { sendFrontendLog } from "@utils/logger/sender";
import { API_ENDPOINTS } from "@constants/apiEndpoints";
import { validateWishlistAddition } from "@businessLogic/wishlistBusinessLogic";
import type { Wishlist,WishlistItem } from "@interfaces/ui/wishlist";
import { mapWishlist } from "@businessLogic/mappers/wishlistMapper";

interface Product {
  id: number;
  name: string;
  price: string | number;
  image_url?: string | null;
}

export default function ProductListFor_CartWishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

  // ✅ Fetch products + wishlist on mount
  useEffect(() => {
    fetchProducts(API_ENDPOINTS.PRODUCTS.LIST);
    fetchWishlist();
  }, []);

  // ✅ Auto-clear messages after 3s
  // useEffect(() => {
  //   if (message) {
  //     const timer = setTimeout(() => setMessage(""), 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [message]);

  const fetchProducts = async (url: string) => {
    try {
      setLoading(true);
      logger.info("Fetching products from:", url);
      const res = await api.get(url);
      const data = res.data;

      if (data.results) {
        setProducts(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
      } else {
        setProducts(data);
        setNextPage(null);
        setPrevPage(null);
      }

      await sendFrontendLog("info", "Product list fetched successfully", { url });
    } catch (err) {
      logger.error("Error fetching products:", err);
      setMessage("❌ Failed to fetch products. Please try again.");
      await sendFrontendLog("error", "Failed to fetch products", { error: err });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist();

      if (res.success && res.data) {
        const mapped = mapWishlist(res.data);
        setWishlist(mapped);
      } else {
        setWishlist(null);
        setMessage(res.error ?? "❌ Could not load wishlist.");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setMessage("❌ Unexpected error occurred.");
    }
  };

  // ✅ Add to Cart
  const handleAddToCart = async (id: number) => {
    setLoadingItemId(id);
    const res = await addToCart(id);
    setMessage(res.success ? "✅ Product added to cart!" : "❌ Failed to add to cart.");
    setLoadingItemId(null);
  };

  // ✅ Add to Wishlist (Optimistic UI, No Flicker)
  const handleAddToWishlist = async (id: number) => {
    const validationMessage = validateWishlistAddition(wishlist, id);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setLoadingItemId(id);
    const res = await addToWishlist(id);
    if (res.success) {
      setMessage("✅ Product added to wishlist!");

      // ✅ Optimistic update (no re-fetch)
      setWishlist((prev) => {
      if (!prev) return prev;

      // ✅ Create a minimal WishlistItem object matching your interface
      const newItem = {
        id: Date.now(),        // Temporary ID for optimistic UI
        productId: id,
      } as WishlistItem;

      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

    } else {
      setMessage("❌ Failed to add to wishlist.");
    }
    setLoadingItemId(null);
  };

  if (loading) {
    return <p className="text-center text-gray-600 mt-6">Loading products...</p>;
  }

  return (
    <div className="container mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        🛍️ Available Products
      </h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded-md text-sm font-medium transition-opacity duration-300 ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : message.startsWith("⚠️")
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-md">
          No products available at the moment.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition flex flex-col"
            >
              <img
                src={
                  product.image_url ||
                  "https://via.placeholder.com/150?text=No+Image"
                }
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-3"
              />

              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1 truncate">
                  {product.name}
                </h4>
                <p className="text-gray-600 font-medium">
                  ₹{Number(product.price).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={loadingItemId === product.id}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-white transition ${
                    loadingItemId === product.id
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loadingItemId === product.id ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={() => handleAddToWishlist(product.id)}
                  disabled={loadingItemId === product.id}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-white transition ${
                    loadingItemId === product.id
                      ? "bg-pink-400 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700"
                  }`}
                >
                  ❤️ Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Pagination Controls */}
      <div className="mt-8 flex justify-between">
        <button
          disabled={!prevPage}
          onClick={() => prevPage && fetchProducts(prevPage)}
          className={`px-4 py-2 rounded-md border ${
            prevPage
              ? "border-gray-400 text-gray-700 hover:bg-gray-100"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          ← Previous
        </button>

        <button
          disabled={!nextPage}
          onClick={() => nextPage && fetchProducts(nextPage)}
          className={`px-4 py-2 rounded-md border ${
            nextPage
              ? "border-gray-400 text-gray-700 hover:bg-gray-100"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}