// src/components/component/PaystackPayment.js
import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { useNavigate } from 'react-router-dom';
import { getExchangeRate } from '../utils/exchangeRate';

const PaystackPayment = ({ email, amount, song, license, uid, beatId, cart }) => {
  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC;
  //const stripe = require("stripe")(process.env.PAYSTACK_SECRET);
  const [amountInKobo, setAmountInKobo] = useState(null);
  const navigate = useNavigate();

  // Convert amount to NGN using dynamic exchange rate
  useEffect(() => {
    async function fetchAmountInKobo() {
      try {
        const rate = await getExchangeRate(); // includes fallback & 3% margin
        setAmountInKobo(Math.round(amount * rate * 100));
      } catch (err) {
        console.error('Failed to get exchange rate:', err);
        setAmountInKobo(null); // shows "Calculating payment..."
      }
    }
    fetchAmountInKobo();
  }, [amount]);

  if (amountInKobo === null) return <p>Calculating payment...</p>;

  // Build lean cart to avoid Paystack 4KB limit
  const leanCart = cart.map(item => ({
    beatId: item.id || item.beatId,
    license: item.license,
    price: item.price,
  }));

  const componentProps = {
    email,
    amount: amountInKobo,
    publicKey,
    text: 'Pay Now',
    currency: 'NGN',
    metadata: {
      uid,
      email,
      cart: leanCart, // ✅ send only lean cart
    },
    onSuccess: () => {
      // Payment verification is handled by webhook
      alert('Payment successful! Check your email for confirmation.');
       // 2️⃣ Clear guest cart from localStorage
  localStorage.removeItem("cart");

      navigate('/purchasedPage');
    },
    onClose: () => {
      alert('Transaction was not completed, window closed.');
    },
    className: 'PaymentPage-button',
  };

  return <PaystackButton {...componentProps} />;
};

export default PaystackPayment;