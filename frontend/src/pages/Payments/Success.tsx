// src/pages/Success.tsx
import { Link, useLocation } from "react-router-dom";

function Success() {
  const location = useLocation();

  // Extract query params (provider, payment id) for extra user context
  const searchParams = new URLSearchParams(location.search);
  const provider = searchParams.get("provider");
  const pid = searchParams.get("pid");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* ✅ Card Container */}
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md text-center">
        {/* 🎉 Success Icon */}
        <div className="text-5xl mb-4">🎉</div>

        {/* 🟢 Success Message */}
        <h2 className="text-2xl font-bold text-green-600">
          Payment Successful!
        </h2>

        <p className="text-gray-600 mt-2">
          Thank you for your purchase.
        </p>

        {/* 🔎 Optional: Show transaction info if available */}
        {pid && (
          <p className="mt-2 text-sm text-gray-500">
            Transaction ID: <span className="font-mono">{pid}</span>
            {provider && ` (${provider})`}
          </p>
        )}

        {/* 🔙 Go Back Button */}
        <Link to="/" className="inline-block mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition">
            Go Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Success;