// src/pages/CartPage.tsx
import { useEffect, useState } from "react";
import api from "@services/api";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
}

interface CartItem {
  id: number;
  product: Product | null;
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch cart items on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart/");
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setActionLoading(true);
      await api.delete(`/cart/remove/${productId}/`);
      setMessage("✅ Product removed from cart");
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setMessage("Failed to remove product");
    } finally {
      setActionLoading(false);
    }
  };
  const handleCheckout = async () => {
  try {
    // Step 1️⃣ Create confirmed order
    
     const res = await api.post("/orders/confirm/");
     const { order_id, total } = res.data;
    // alert("Order confirmed! Proceeding to payment. for order_id ="+order_id +"Total= "+ total);
    console.log("✅ Order confirmed:", res.data);

    // Step 2️⃣ Go to payment page with backend total & order_id
    navigate("/checkout-stripe", { state: { orderId: order_id, total } });
    //navigate("/checkout-stripe", { state: { total } })
  } catch (err: any) {
    console.error("❌ Failed to confirm order:", err);
    alert("Failed to confirm order. Please try again.");
  }
};


  // ✅ Calculate total amount
  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // ===============================
  // 🧩 UI Rendering
  // ===============================
  if (loading) {
    return <p className="text-center text-gray-600 mt-6">Loading cart...</p>;
  }

  return (
    <div className="container mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        🛒 Your Cart
      </h2>

      {/* ✅ Message Banner */}
      {message && (
        <div
          className={`mb-4 p-2 rounded-md text-sm font-medium transition ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* ✅ Empty State */}
      {items.length === 0 ? (
        <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-md">
          Your cart is empty. If you just completed a payment, please check “My Orders” 🛒
        </div>
      ) : (
        <>
          {/* ✅ Product Grid Layout */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition flex flex-col"
                >
                  {/* Product Image */}
                  <img
                    src={
                      product.image_url ||
                      "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1 truncate">
                      {product.name}
                    </h4>
                    <p className="text-gray-600 font-medium">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    disabled={actionLoading}
                    className={`mt-3 px-3 py-2 rounded-md text-sm text-white font-medium transition ${
                      actionLoading
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionLoading ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ✅ Total Summary Card */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between items-center border-t pt-4">
            <div className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
              Total: <span className="text-green-700">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition font-medium"
            >
              Proceed to Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}