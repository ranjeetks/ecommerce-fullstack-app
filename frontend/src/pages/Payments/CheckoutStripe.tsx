// src/pages/CheckoutStripe.tsx
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "@services/api";
import { useLocation } from "react-router-dom";

// Load Stripe publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const location = useLocation();
  const total = location.state?.total || 0; 
  const orderId = location.state?.orderId;

  //alert("🧾 CheckoutStripe loaded: Total="+total +" orderID"+ orderId);

//alert(total);
  useEffect(() => {

    if (!total) {
    setStatus("Missing order or total amount. Please go back to cart.");
    return;
  }
    const createPaymentIntent = async () => {
      if (!total || total*100 < 5000) {
        // Stripe requires at least ₹50 (5000 paise)
        setStatus("Invalid amount (minimum is ₹50).");
        return;
      }
      console.log("👉 Sending payment request with:", { amount: total });

      try {
        const res = await api.post(
          "/stripe/create-payment-intent/",
          JSON.stringify({
            order_id: orderId,
            //amount: total * 100,
            amount: total,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("✅ Received clientSecret:", res.data);
        setClientSecret(res.data.clientSecret);
      } catch (err: any) {
        console.error("❌ Failed to create payment intent:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
        });
        setStatus("failed to create payment intent");
      }
    };
    createPaymentIntent();
  }, [total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setStatus("processing");

    const card = elements.getElement(CardElement);
    if (!card) return;

    console.log("👉 Confirming card payment with Stripe...");

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: "Test Buyer" },
      },
    });

    if (result.error) {
      console.error("❌ Stripe payment error:", result.error.message);
      window.location.href = `/failure?reason=${encodeURIComponent(
        result.error.message || "Unknown error"
      )}`;
    } else if (result.paymentIntent?.status === "succeeded") {
      console.log("✅ Payment succeeded:", result.paymentIntent.id);
      setStatus("succeeded");
      window.location.href =
        "/success?provider=stripe&pid=" + result.paymentIntent.id;
    }
  };

  return (
    <div className="container mx-auto max-w-md mt-10 p-6 border rounded-2xl shadow-md bg-white">
      <h3 className="text-xl font-bold text-center mb-4">
        💳 Checkout — Pay ₹{(total).toFixed(2)}
      </h3>

      {!clientSecret && status && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">{status}</div>
      )}

      {clientSecret && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter Card Details
            </label>
            <div className="p-3 border rounded-lg shadow-sm bg-gray-50">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1a202c",
                      fontFamily: "Arial, sans-serif",
                      "::placeholder": { color: "#a0aec0" },
                    },
                    invalid: { color: "#e53e3e", iconColor: "#e53e3e" },
                  },
                }}
              />
            </div>
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            disabled={!stripe || status === "processing"}
          >
            {status === "processing"
              ? "Processing..."
              : `Pay ₹${(total).toFixed(2)}`}
          </button>
        </form>
      )}

      {status && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Status: {status}
        </div>
      )}
    </div>
  );
};

// Wrap CheckoutForm with Stripe Elements provider
const CheckoutStripePage: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutStripePage;