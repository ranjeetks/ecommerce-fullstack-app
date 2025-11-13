// src/pages/CheckoutRazorpay.tsx
import React from "react";
import api from "@services/api";

declare global {
  interface Window { Razorpay: any; }
}

const CheckoutRazorpay: React.FC = () => {
  const handleBuy = async () => {
    try {
      const res = await api.post("/api/razorpay/create-order/", { amount: 99900 });
      const order = res.data.order;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // rzp_test_...
        amount: order.amount, // paise
        currency: order.currency,
        name: "Test Product",
        description: "Test Product - ₹999",
        order_id: order.id,
        handler: function (response: any) {
          // send response (payment_id, order_id, signature) to backend to verify
          api.post("/api/razorpay/verify-payment/", response)
            .then(() => window.location.href = `/success?provider=razorpay&pid=${response.razorpay_payment_id}`)
            .catch(() => window.location.href = "/failure");
        },
        prefill: { name: "Test Buyer", email: "buyer@example.com" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Checkout — Test Product ₹999 (Razorpay)</h3>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition" onClick={handleBuy}>Pay ₹999</button>
    </div>
  );
};

export default CheckoutRazorpay;