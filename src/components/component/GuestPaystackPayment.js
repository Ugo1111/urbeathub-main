import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { getFirestore, doc, collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Modal from 'react-modal'; // Import Modal
import { ToastContainer, toast } from "react-toastify";

const GuestPaystackPayment = ({ email, amount, last, song, license, uid, beatId }) => {
  const publicKey = 'pk_live_5792ddb6cca1c8c89244595e5607e81e9a63e35c'; // Keep this as it was
  const exchangeRate = 1500; // 1 USD = 1500 NGN
  const amountInKobo = Math.round(amount * exchangeRate * 100); // Convert USD to Kobo properly

  // Initialize Firestore
  const db = getFirestore();
  const navigate = useNavigate(); // Initialize navigate

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const componentProps = {
    email,
    amount: amountInKobo,
    publicKey,
    text: 'Pay Now',
    currency: 'NGN',
    onSuccess: async (reference) => {
      console.log('Payment reference:', reference);

      try {
        const purchasesCollectionRef = collection(db, 'Guest-Purchases');

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

        await addDoc(purchasesCollectionRef, paymentDetails);

        // Save license, price, and user ID to the beats/{beatId}/purchases subcollection
        const beatSubCollectionRef = collection(doc(db, 'beats', beatId), 'purchases');
        await addDoc(beatSubCollectionRef, {
          reference: paymentDetails.reference,
          license: paymentDetails.license,
          price: paymentDetails.amount,
          userId: paymentDetails.userId,
          timestamp: paymentDetails.timestamp,
          email: paymentDetails.email,
        });

        console.log('Payment details saved to Firestore:', paymentDetails);
        console.log('License details saved to beats collection.');

        // Show success modal
        setModalIsOpen(true);

        // Redirect to the home page after 3 seconds
        setTimeout(() => {
          setModalIsOpen(false);
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error saving payment to Firestore:', error);
        alert(`An error occurred while saving the payment details: ${error.message}`);
      }
    },
    onClose: () => {
      toast.error('Transaction was not completed, window closed.', {
        position: 'top-center',
      });
    },
    metadata: { last },
    className: 'PaymentPage-button',
  };

  return (
    <>
      <PaystackButton {...componentProps} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Payment Success"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Woohoo! 🎉</h2>
        <p>Your track has been sent to your chosen email.</p>
      </Modal>
    </>
  );
};

export default GuestPaystackPayment;
