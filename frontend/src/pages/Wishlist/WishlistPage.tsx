// src/pages/WishlistPage.tsx
import { useEffect, useState } from "react";
import api from "@services/api";
import { removeFromWishlist } from "@services/wishlistService";
import { mapWishlist } from "@businessLogic/mappers/wishlistMapper";
import type { Wishlist } from "@interfaces/ui/wishlist";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist/");
      const mapped = mapWishlist(res.data);
      setWishlist(mapped);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setMessage("❌ Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    const res = await removeFromWishlist(productId);
    setMessage(res.message?? "");
    fetchWishlist();
  };

  if (loading) return <p>Loading wishlist...</p>;
  if (!wishlist) return <p>No wishlist data found.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Wishlist</h2>

      {message && (
        <p className="mb-3 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded">
          {message}
        </p>
      )}

      {wishlist.items.length === 0 ? (
        <p className="text-gray-600 italic">No items in wishlist.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
              <p
                className={`mt-1 text-sm ${
                  item.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.stock > 0 ? "In stock" : "Out of stock"}
              </p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}