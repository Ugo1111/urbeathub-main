import React from 'react';
import { PaystackButton } from 'react-paystack';
import { getFirestore, doc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const PaystackPayment = ({ email, amount, last, song, license, uid, beatId }) => {
  const publicKey = 'pk_live_5792ddb6cca1c8c89244595e5607e81e9a63e35c'; // Keep this as it was
  const exchangeRate = 1500; // 1 USD = 1500 NGN
  const amountInKobo = Math.round(amount * exchangeRate * 100); // Convert USD to Kobo properly

  // Initialize Firestore
  const db = getFirestore();
  const navigate = useNavigate(); // Initialize navigate

  const componentProps = {
    email,
    amount: amountInKobo,
    publicKey,
    text: 'Pay Now',
    currency: 'NGN',
    onSuccess: async (reference) => {
      console.log('Payment reference:', reference);

      // Define payment details and ensure no field is undefined
      const paymentDetails = {
        reference: reference.reference || 'N/A',
        email: email || 'N/A',
        song: song || 'N/A',
        license: license || 'N/A',
        amount: amount || 0, // Default amount in USD
        userId: uid || 'N/A',
        beatId: beatId || 'N/A',
        timestamp: new Date(), // Add current timestamp
      };

      try {
        // Save payment details to the user's document in beatHubUsers collection
        const purchasesCollectionRef = collection(doc(db, 'beatHubUsers', uid), 'purchases');
        await addDoc(purchasesCollectionRef, paymentDetails);

        // Save license, price, and user ID to the beats/{beatId}/licenses subcollection
        const beatSubCollectionRef = collection(doc(db, 'beats', beatId), 'purchases');
        await addDoc(beatSubCollectionRef, {
          reference: paymentDetails.reference,
          license: paymentDetails.license,
          price: paymentDetails.amount,
          userId: paymentDetails.userId,
          timestamp: paymentDetails.timestamp,
        });

        console.log('Payment details saved to Firestore:', paymentDetails);
        console.log('License details saved to beats collection.');

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
