import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/addToCart.css";

export default function HandleAddToCart({ song, selectedLicense }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  /* ------------------------------------------------
     MERGE GUEST CART → FIRESTORE ON LOGIN
  -------------------------------------------------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const localCartRaw = localStorage.getItem("cart");
      if (!localCartRaw) return;

      const localCart = JSON.parse(localCartRaw);
      const userCartRef = collection(db, "beatHubUsers", user.uid, "cart");

      for (const item of localCart) {
        const q = query(
          userCartRef,
          where("songId", "==", item.songId),
          where("license", "==", item.license)
        );

        const snap = await getDocs(q);
        if (snap.empty) {
          await addDoc(userCartRef, {
            songId: item.songId,
            license: item.license,
            createdAt: serverTimestamp(),
          });
        }
      }

      localStorage.removeItem("cart");
    });

    return () => unsubscribe();
  }, [auth, db]);

  /* ------------------------------------------------
     CHECK IF ITEM IS ALREADY IN CART
  -------------------------------------------------*/
  useEffect(() => {
    const checkIfInCart = async () => {
      const user = auth.currentUser;

      // 🔹 Guest
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setIsInCart(
          localCart.some(
            (i) => i.songId === song?.id && i.license === selectedLicense?.name
          )
        );
        return;
      }

      // 🔹 Logged-in
      if (!song || !selectedLicense) return;

      const cartRef = collection(db, "beatHubUsers", user.uid, "cart");
      const q = query(
        cartRef,
        where("songId", "==", song.id),
        where("license", "==", selectedLicense.name)
      );

      const snap = await getDocs(q);
      setIsInCart(!snap.empty);
    };

    checkIfInCart();
  }, [auth, db, song, selectedLicense]);

  /* ------------------------------------------------
     ADD TO CART
  -------------------------------------------------*/
  const handleAddToCart = async () => {
    const user = auth.currentUser;

    if (!song || !selectedLicense) {
      toast.error("Please select a license");
      return;
    }

    /* ---------- GUEST ---------- */
    if (!user) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingIndex = localCart.findIndex(
        (i) => i.songId === song.id
      );

      if (existingIndex !== -1) {
        // 🔁 Upgrade license
        localCart[existingIndex].license = selectedLicense.name;
        toast.success("License updated in cart");
      } else {
        localCart.push({
          songId: song.id,
          title: song.title,
          license: selectedLicense.name,
          price: selectedLicense.price,
          coverUrl: song.coverUrl,
        });
        toast.success("Added to cart");
      }

      localStorage.setItem("cart", JSON.stringify(localCart));
      setIsInCart(true);
      return;
    }

/* ---------- LOGGED-IN ---------- */
setIsAdding(true);

try {
  const userCartCol = collection(db, "beatHubUsers", user.uid, "cart");

  // 🔎 Check existing song (any license)
  const q = query(userCartCol, where("songId", "==", song.id));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // 🔁 Upgrade license
    await updateDoc(snap.docs[0].ref, {
      license: selectedLicense.name,
    });

    toast.success("License upgraded in cart");
  } else {
    // 1️⃣ CREATE USER CART ITEM (AUTO ID)
    const userCartDocRef = doc(userCartCol); // pre-generate ID

    await setDoc(userCartDocRef, {
      songId: song.id,
      songTitle: song.title,
      license: selectedLicense.name,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    // 2️⃣ CREATE GLOBAL CART WITH SAME ID
    await setDoc(doc(db, "Cart", userCartDocRef.id), {
      userId: user.uid,
      userCartPath: `beatHubUsers/${user.uid}/cart/${userCartDocRef.id}`,
      songId: song.id,
      songTitle: song.title,
      license: selectedLicense.name,
      createdAt: serverTimestamp(),
    });

    toast.success("Added to cart");
  }

  setIsInCart(true);
} catch (err) {
  console.error(err);
  toast.error("Failed to add to cart");
} finally {
  setIsAdding(false);
}




  };

  return (
    <button
      className="add-to-cart-btn"
      disabled={isAdding}
      onClick={isInCart ? () => navigate("/CartPage") : handleAddToCart}
    >
      {isAdding ? "Adding..." : isInCart ? "View Cart" : "Add to Cart"}
    </button>
  );
}