import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckout from "./StripeCheckoutForm";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);

export default function StripeWrapper({ amount, email, onSuccess, onError, uid, cart }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  // Build leanCart from passed cart items
  const leanCart = cart.map(item => ({
    beatId: item.beatId || item.id || item.songId,
    license: item.license,
    price: item.price,
  }));

  const handleCreateIntent = async () => {
    if (!email || !uid || !leanCart.length) {
      onError?.("Missing required parameters or cart is empty");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        "https://us-central1-beathub-4e595.cloudfunctions.net/createPaymentIntent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            uid,
            cart: leanCart, // send all items in cart
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        onError?.(data.error || "Failed to create payment intent");
      }
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <button disabled>Preparing...</button>;

  if (!clientSecret) {
    return (
      <button onClick={handleCreateIntent}>
        Proceed To Checkout
      </button>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckout
        clientSecret={clientSecret}
        amount={amount}
        email={email}
        onSuccess={onSuccess}
        onError={onError}
        uid={uid}
        cart={leanCart} // ✅ pass full cart to StripeCheckoutForm
      />
    </Elements>
  );
}