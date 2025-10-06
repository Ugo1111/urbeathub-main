import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckout from "./StripeCheckoutForm";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);

const StripeElementsWrapper = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

function StripePayment({ email, amount, song, license, beatId, onSuccess }) {
  return (
    <div className="stripe-payment-container">
      <h2>Stripe Payment</h2>
      <p>Song: {song}</p>
      <p>License: {license}</p>
      <p>Amount: {amount}</p>
      <p>Email: {email}</p>
      <StripeElementsWrapper>
        <StripeCheckout
          amount={amount}
          email={email}
          song={song}
          license={license}
          beatId={beatId}
          onSuccess={onSuccess}
        />
      </StripeElementsWrapper>
    </div>
  );
}

export default StripePayment;
