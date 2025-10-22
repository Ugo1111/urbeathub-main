import React, { useState, useEffect, useRef } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom"; // Step 1: Import navigate
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from 'react-toastify';

function StripeCheckout({ amount, clientSecret, email, last, song, license, uid, beatId ,onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate(); // Step 2: Initialize navigate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [purchasedLicenses, setPurchasedLicenses] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  const licenseTier = {
    "Basic License": 1,
    "Premium License": 2,
    "Unlimited License": 3,
    "Exclusive License": 4,
  };

  useEffect(() => {
    const fetchPurchasedLicenses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const purchasesRef = collection(db, `beatHubUsers/${user.uid}/purchases`);
        const purchasesSnapshot = await getDocs(purchasesRef);

        const ownedLicenses = [];
        purchasesSnapshot.forEach((purchaseDoc) => {
          const { beatId: purchasedBeatId, license: purchasedLicense } = purchaseDoc.data();
          if (purchasedBeatId === beatId) {
            ownedLicenses.push(purchasedLicense);
          }
        });

        setPurchasedLicenses(ownedLicenses);
      } catch (error) {
        console.error("Error fetching purchased licenses:", error);
      }
    };

    fetchPurchasedLicenses();
  }, [auth.currentUser, beatId]);


  const handlePayment = async (e) => {
    e.preventDefault();
  
    if (!stripe || !elements) return;
  
    // Step 1: submit elements immediately
    const submitResult = await elements.submit();
    if (submitResult.error) {
      setError(submitResult.error.message);
      return;
    }
  
    setLoading(true);
  
    try {
      // Step 2: async checks (like checking purchased licenses)
      // const selectedLicenseTier = licenseTier[license] || 0;
      // const highestOwnedTier = Math.max(...purchasedLicenses.map(l => licenseTier[l] || 0), 0);
  
      // if (selectedLicenseTier <= highestOwnedTier) {
      //   alert(`You already purchased this license or a higher one (${license}).`);
      //   setLoading(false);
      //   return;
      // }
  
      // Step 3: confirm the payment
      const { error: stripeError , paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/purchasedPage`,
          payment_method_data: {
            billing_details: { email },
          },
        },
        clientSecret,
      });
  
      if (stripeError) {
        setError(stripeError.message);
      }

      
  


    } catch (err) {
      console.error("Error during payment:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
      {/* {!showPaymentForm && (
        <button type="button" onClick={() => setShowPaymentForm(true)}>
          Proceed To Checkout
        </button>
      )} */}
      return (
  <form onSubmit={handlePayment}>
    <div style={{ padding: "1rem 0" }}>
      <PaymentElement />
    </div>
    <button type="submit" disabled={loading}>
      {loading ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`}
    </button>
    {error && <div>{error}</div>}
  </form>

  );
}

export default StripeCheckout;