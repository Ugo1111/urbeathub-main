import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify'
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

    // Check Firestore cart if user is logged in
    if (user && song && selectedLicense) {
      try {
        const cartRef = doc(db, `beatHubUsers/${user.uid}`);
        const cartSnapshot = await getDoc(cartRef);

        const firestoreCart = cartSnapshot.exists() ? cartSnapshot.data().cart || [] : [];
        const inFirestoreCart = firestoreCart.some(
          (item) => item.songId === song.id && item.license === selectedLicense.name
        );

        // Check localStorage as well
        const localCartRaw = localStorage.getItem("cart");
        const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
        const inLocalCart = localCart.some(
          (item) => item.songId === song.id && item.license === selectedLicense.name
        );

        setIsInCart(inFirestoreCart || inLocalCart); // True if found in either
      } catch (error) {
        console.error("Error checking cart:", error);
      }
    } 
    // For guests (not logged in), check only localStorage
    else if (!user && song && selectedLicense) {
      const localCartRaw = localStorage.getItem("cart");
      const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
      const inLocalCart = localCart.some(
        (item) => item.songId === song.id && item.license === selectedLicense.name
      );
      setIsInCart(inLocalCart);
    }
  };

  checkIfInCart();
}, [auth, db, song, selectedLicense]);

  const handleAddToCart = async () => {
    const user = auth.currentUser;

    // If user isn't signed in, save cart to localStorage
    if (!user) {
      if (!song || !selectedLicense) {
        alert("Please select a license type.");
        return;
      }
      try {
        // Get existing local cart if any
        const existingCart = localStorage.getItem("cart");
        const localCart = existingCart ? JSON.parse(existingCart) : [];

        // Check if the song is already in the local cart with a different license
        const itemIndex = localCart.findIndex(
          (item) => item.songId === song.id && item.license !== selectedLicense.name
        );

        if (itemIndex !== -1) {
          // Update the license and price
          localCart[itemIndex] = {
            ...localCart[itemIndex],
            license: selectedLicense.name,
            price: selectedLicense.price,
          };
          toast.success("Updated license in local cart!", {
            position: "top-center",
          });
        } else {
          // Add new item to local cart
          localCart.push({
            songId: song.id,
            title: song.title,
            license: selectedLicense.name,
            price: selectedLicense.price,
            coverUrl: song.coverUrl,
          });
          toast.success("Added to local cart!", {
            position: "top-center",
          });
        }
        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(localCart));
        setIsInCart(true);
        return;
      } catch (error) {
        console.error("Error saving to local cart:", error);
        toast.error("Failed to update local cart.", {
          position: "top-center",
        });
        return;
      }
    }

    // User is signed in — continue with saving to Firestore
    setIsAdding(true);
    try {
      const cartRef = doc(db, `beatHubUsers/${user.uid}`);
      // Get the current cart
      const cartSnapshot = await getDoc(cartRef);
      const cart = cartSnapshot.exists() ? cartSnapshot.data().cart || [] : [];

      // Check if the song is in the cart with a different license
      const itemIndex = cart.findIndex(
        (item) => item.songId === song.id && item.license !== selectedLicense.name
      );

      if (itemIndex !== -1) {
        const updatedCart = [...cart];
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          license: selectedLicense.name,
          price: selectedLicense.price,
        };

        await updateDoc(cartRef, {
          cart: updatedCart,
        });
        toast.success("Updated license in cart!", {
          position: "top-center",
        });
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

        toast.success("Added to cart!", {
          position: "top-center",
        });
        setIsInCart(true);
      }
    } catch (error) {
      console.error("Error adding/updating cart:", error);
      toast.error("Failed to add or update cart.", {
        position: "top-center",
      });
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
