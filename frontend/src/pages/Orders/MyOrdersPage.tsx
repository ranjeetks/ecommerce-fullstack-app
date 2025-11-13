import { useEffect, useState } from "react";
import api from "@services/api";
import { PackageCheck, ShoppingBag, Loader2, AlertCircle } from "lucide-react";

// ---------------------------
// 🧩 Interfaces
// ---------------------------
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  product_name: string | null;
  product_image: string | null;
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

// ---------------------------
// 🧩 My Orders Page
// ---------------------------
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my/");
      const data = res.data;

      const ordersList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(ordersList);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError("⚠️ Failed to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🧩 UI Helpers
  // ---------------------------
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border border-green-300";
      case "FAILED":
        return "bg-red-100 text-red-700 border border-red-300";
      case "CANCELED":
        return "bg-gray-200 text-gray-700 border border-gray-300";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // ---------------------------
  // 🧩 Render
  // ---------------------------
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
        <span className="ml-2 text-gray-600">Loading your orders...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center bg-red-50 text-red-700 border border-red-300 rounded-md p-4 mt-6 max-w-lg mx-auto">
        <AlertCircle className="mr-2" />
        <p>{error}</p>
      </div>
    );

  return (
    <div className="w-full px-6 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <PackageCheck className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-300 text-blue-700 px-4 py-4 rounded-lg">
          <ShoppingBag className="w-5 h-5" />
          <span>You have no orders yet. Start shopping!</span>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-5 bg-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg text-gray-800">
                  Order #{order.id}
                </h4>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Meta Info */}
              <p className="text-sm text-gray-500">
                Placed on: {formatDate(order.created_at)}
              </p>
              <p className="text-lg font-bold text-gray-800 mt-1">
                Total: ₹{parseFloat(order.total_amount).toFixed(2)}
              </p>

              {/* Items */}
              <div className="mt-4">
                <h5 className="font-semibold text-gray-700 mb-2">Items:</h5>
                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-2"
                    >
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name || `Product ${item.product_id}`}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          🛍️
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.product_name || `Product #${item.product_id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}