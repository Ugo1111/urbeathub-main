import React, { useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import Modal from 'react-modal'; // Import Modal
import "../css/addToCart.css";

export default function HandleAddToCart({ song, selectedLicense }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false); // Track if item is in cart
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); // Initialize the navigate function

  // Check if the item is in the cart on initial render
  useEffect(() => {
    const checkIfInCart = async () => {
      const user = auth.currentUser;
      if (user && song && selectedLicense) {
        try {
          const cartRef = doc(db, `beatHubUsers/${user.uid}`);
          const cartSnapshot = await getDoc(cartRef);

          if (cartSnapshot.exists()) {
            const cart = cartSnapshot.data().cart || [];
            const itemIndex = cart.findIndex(
              (item) =>
                item.songId === song.id && item.license === selectedLicense.name
            );
            setIsInCart(itemIndex !== -1); // If the item exists with the same license, it's in the cart
          }
        } catch (error) {
          console.error("Error checking cart:", error);
        }
      }
    };

    checkIfInCart();
  }, [auth, db, song, selectedLicense]);

  const handleAddToCart = async () => {
    const user = auth.currentUser;

    if (!user) {
      setModalIsOpen(true); // Open modal if user is not signed in
      return;
    }

    if (!song || !selectedLicense) {
      alert("Please select a license type.");
      return;
    }

    setIsAdding(true);

    try {
      const cartRef = doc(db, `beatHubUsers/${user.uid}`);

      // Get the current cart
      const cartSnapshot = await getDoc(cartRef);
      const cart = cartSnapshot.exists() ? cartSnapshot.data().cart || [] : [];

      // Check if the song is already in the cart with a different license
      const itemIndex = cart.findIndex(
        (item) =>
          item.songId === song.id && item.license !== selectedLicense.name
      );

      if (itemIndex !== -1) {
        // If the song is found with a different license, update the license in the cart
        const updatedCart = [...cart];
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          license: selectedLicense.name,
          price: selectedLicense.price,
        };

        // Update the cart in Firestore
        await updateDoc(cartRef, {
          cart: updatedCart,
        });

        alert("Updated license in cart!");
        setIsInCart(true);
      } else {
        // Add new item to cart if it doesn't exist with the same license
        await setDoc(
          cartRef,
          {
            cart: arrayUnion({
              songId: song.id,
              title: song.title,
              license: selectedLicense.name,
              price: selectedLicense.price,
              coverUrl: song.coverUrl,
            }),
          },
          { merge: true }
        );

        alert("Added to cart!");
        setIsInCart(true); // Update the state to reflect the item is now in the cart
      }
    } catch (error) {
      console.error("Error adding/updating cart:", error);
      alert("Failed to add or update cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewCart = () => {
    navigate("/CartPage"); // Navigate to the CartPage
  };

  return (
    <>
      <button
        className="add-to-cart-btn"
        onClick={isInCart ? handleViewCart : handleAddToCart} // Redirect if in cart, else add item to cart
        disabled={isAdding}
      >
        {isAdding ? "Adding..." : isInCart ? "View Cart" : "Add to Cart"}
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Sign In Required"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Sign In Required</h2>
        <p>Please sign in to add items to your cart.</p>
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </>
  );
}
