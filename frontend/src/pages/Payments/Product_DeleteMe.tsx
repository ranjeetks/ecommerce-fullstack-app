import { Link } from "react-router-dom";

function Product() {
  return (
    <div className="container mx-auto max-w-md p-6 text-center">
      {/* ✅ Product Card with a professional look */}
      <div className="border rounded-2xl shadow-md p-6">
        {/* Product Title */}
        <h2 className="text-2xl font-semibold mb-2">Sample Product</h2>
        <p className="text-gray-700 mb-4">High-quality product for demo purposes</p>

        {/* Price Section */}
        <p className="text-xl font-bold text-green-600 mb-6">₹499</p>

        {/* ✅ Buttons look consistent and aligned */}
        <div className="flex justify-center gap-4">
          {/* Stripe Checkout Button */}
          <Link to="/checkout-stripe">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Pay with Stripe
            </button>
          </Link>

          {/* Razorpay Checkout Button */}
          <Link to="/checkout-razorpay">
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Pay with Razorpay
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Product;