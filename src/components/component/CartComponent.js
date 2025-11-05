import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/checkout.css";
import djImage from '../../images/dj.jpg';
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";
import { useUpgradePrice } from "../component/UpgradePrice.js";
import { FaInfoCircle } from "react-icons/fa";

function CartItem({
  song,
  displayPrice,
  originalPrice,
  user,
  userCountry,
  exchangeRate,
  handleDeleteCartItem,
  loading,
  error,
}) {
  const formatPrice = (usdAmount) => {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "NG" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  return (
    <li key={song.songId} className="cart-list-item">
      <div className="cart-list-info">
        <img src={song.coverUrl || djImage} className="cart-list-image" alt="Song Cover" />
        <div className="cart-list-item-title-license">
          <div className="cart-list-item-title">{song.title || "Unknown Title"}</div>
          <div className="cart-list-item-license">{song.license }</div>
          <div className="cart-list-producer-info">
          <img src={song.uploaderProfilePic || djImage} className="cart-list-user-pic" alt="Uploader Profile" />
          <div className="cart-list-item-license">{song.username}</div>
          </div>
          {song?.delay === true && (
 <p className="delay-delivery-note" title="This item will be delivered within 24hrs.">
    Delivery within 24hr   <FaInfoCircle className="info-icon" />
  </p>
)}
        </div>
      </div>

      <div className="cart-list-actions">
        <div className="cart-list-price">
          {loading ? (
  "Calculating upgrade..."
) : error ? (
  <span style={{ color: "red" }}>{error}</span>
) :displayPrice !== originalPrice ? (
            <>
              {formatPrice(displayPrice)}
              <span style={{ textDecoration: "line-through", color: "gray", marginLeft: "8px" }}>
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            formatPrice(originalPrice)
          )}
        </div>
        <button
          className="cart-list-remove-btn"
          onClick={() => handleDeleteCartItem(song.songId)}
        >
          x
        </button>
      </div>
    </li>
  );
}

function CartComponent({ cart, setCart }) {
  const auth = getAuth();
  const db = getFirestore();
  const userCountry = useUserLocation();
  const [exchangeRate, setExchangeRate] = useState(null);

  const user = auth.currentUser;

  // Fetch exchange rate if user is in GB
  useEffect(() => {
    if (userCountry === "NG") {
      async function fetchRate() {
        try {
          const rate = await getExchangeRate();
          setExchangeRate(rate);
        } catch {
          setExchangeRate(null);
        }
      }
      fetchRate();
    }
  }, [userCountry]);

  const handleDeleteCartItem = async (songId) => {
    if (user) {
      // Signed-in user: delete from Firebase
      const userRef = doc(db, "beatHubUsers", user.uid);
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
  
        const userData = userSnap.data();
        const updatedCart = userData.cart.filter((item) => item.songId !== songId);
  
        await updateDoc(userRef, { cart: updatedCart });
        setCart(updatedCart);
      } catch (error) {
        console.error("Error deleting cart item:", error);
      }
    } else {
      // Guest: delete from localStorage
      const existingCart = localStorage.getItem("cart");
      const localCart = existingCart ? JSON.parse(existingCart) : [];
      const updatedCart = localCart.filter((item) => item.songId !== songId);
  
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    }
  };

  // ✅ Call useUpgradePrice once for the whole cart
  const { upgradePrice, itemizedCart, loading, error } = useUpgradePrice({
    email: user?.email || null,
    uid: user?.uid || null,
    cart,              // pass full cart array
    selectedLicense: null, // because multiple items
  });

  return (
    <div className="cart-Component-wrapper">
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ol className="cart-component-list">
          {cart.map((song) => {
            const itemUpgrade = itemizedCart.find(
              (u) => u.beatId === song.songId || u.beatId === song.id
            );
            const displayPrice = itemUpgrade?.finalPrice || parseFloat(song.price.replace('$', ''));
            const originalPrice = parseFloat(song.price.replace('$', ''));

            return (
              <CartItem
                key={song.songId}
                song={song}
                displayPrice={displayPrice}
                originalPrice={originalPrice}
                user={user}
                userCountry={userCountry}
                exchangeRate={exchangeRate}
                handleDeleteCartItem={handleDeleteCartItem}
                loading={loading}
                error={error}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default CartComponent;