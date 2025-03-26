import React from 'react';
import { PaystackButton } from 'react-paystack';
import { getFirestore, doc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const PaystackPayment = ({ email, amount, last, song, license, uid, beatId, cart, setCart }) => {
  const publicKey = 'pk_test_36a4dd978ecfdfd6434270cdbfee04e41bfff64d'; // Keep this as it was
  const exchangeRate = 1500; // 1 USD = 1500 NGN
  const amountInKobo = Math.round(amount * exchangeRate * 100); // Convert USD to Kobo properly

  // Initialize Firestore
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  const componentProps = {
    email,
    amount: amountInKobo,
    publicKey,
    text: 'Pay Now',
    currency: 'NGN',
    onSuccess: async (reference) => {
      console.log('Payment reference:', reference);

      try {
        const user = auth.currentUser;
        if (!user) return;

        const purchasesCollectionRef = collection(doc(db, 'beatHubUsers', uid), 'purchases');

        // Loop through each item in the cart and save payment details
        for (const item of cart) {
          const paymentDetails = {
            reference: reference.reference || 'N/A',
            email: email || 'N/A',
            song: item.title || 'N/A',
            license: item.license || 'N/A',
            amount: item.price || 0, // Default amount in USD
            userId: uid || 'N/A',
            beatId: item.songId || 'N/A',
            timestamp: new Date(), // Add current timestamp
          };

          await addDoc(purchasesCollectionRef, paymentDetails);

          // Save license, price, and user ID to the beats/{beatId}/licenses subcollection
          const beatSubCollectionRef = collection(doc(db, 'beats', item.songId), 'purchases');
          await addDoc(beatSubCollectionRef, {
            reference: paymentDetails.reference,
            license: paymentDetails.license,
            price: paymentDetails.amount,
            userId: paymentDetails.userId,
            timestamp: paymentDetails.timestamp,
          });

          console.log('Payment details saved to Firestore:', paymentDetails);
          console.log('License details saved to beats collection.');
        }

        // Empty the cart
        setCart([]);
        await updateDoc(doc(db, 'beatHubUsers', uid), { cart: [] });

        // Redirect to the purchase page after 1 second
        setTimeout(() => {
          navigate('/purchasedPage');
        }, 1000);
      } catch (error) {
        console.error('Error saving payment to Firestore:', error);
        alert(`An error occurred while saving the payment details: ${error.message}`);
      }
    },
    onClose: () => {
      alert('Transaction was not completed, window closed.');
    },
    metadata: { last },
    className: 'PaymentPage-button',
  };

  return <PaystackButton {...componentProps} />;
};

export default PaystackPayment;
