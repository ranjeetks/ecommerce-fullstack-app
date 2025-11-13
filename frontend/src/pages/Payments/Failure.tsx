// src/pages/Failure.tsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Failure() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get("reason");

  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (reason && reason.toLowerCase().includes("cancel")) {
      setIsCancelled(true);
    }
  }, [reason]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* Card Container */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center border border-gray-200">
        {/* Icon */}
        <div className="text-6xl mb-3">{isCancelled ? "🚫" : "❌"}</div>

        {/* Title */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            isCancelled ? "text-yellow-600" : "text-red-600"
          }`}
        >
          {isCancelled ? "Payment Cancelled" : "Payment Failed"}
        </h2>

        {/* Message */}
        <p className="text-gray-600 leading-relaxed">
          {isCancelled ? (
            <>
              You cancelled the payment before it could be completed.
              <br />
              Don’t worry — your cart is still intact. 🛒
            </>
          ) : (
            <>
              Unfortunately, your payment could not be processed.
              <br />
              You can retry the payment or go back home.
            </>
          )}
        </p>

        {/* Reason (optional) */}
        {reason && (
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Reason:</span>{" "}
            <span className="italic">{reason}</span>
          </div>
        )}

        {/* Buttons Section */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          {isCancelled ? (
            <>
              <Link to="/cart">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition">
                  Back to Cart
                </button>
              </Link>
              <Link to="/">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition">
                  Go Back Home
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/cart">
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition">
                  Return to Cart to Retry
                </button>
              </Link>
              <Link to="/">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition">
                  Go Back Home
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Subtle support tip */}
        <p className="mt-6 text-xs text-gray-400">
          Need help? Contact{" "}
          <a
            href="mailto:support@yourshop.com"
            className="text-blue-600 hover:underline"
          >
            support@yourshop.com
          </a>
        </p>
      </div>
    </div>
  );
}