import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/checkout.css";
import djImage from "../../images/dj.jpg";
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";
import { useUpgradePrice } from "../component/UpgradePrice.js";

/* =======================
   CART ITEM COMPONENT
======================= */
function CartItem({
  song,
  displayPrice,
  originalPrice,
  userCountry,
  exchangeRate,
  handleDeleteCartItem,
  loading,
  error,
}) {
  const formatPrice = (usdAmount = 0) => {
    if (userCountry === "NG" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  return (
    <li className="cart-list-item">
      <div className="cart-list-info">
        <img
          src={song.coverUrl || djImage}
          className="cart-list-image"
          alt="Song Cover"
        />
        <div className="cart-list-item-title-license">
          <div className="cart-list-item-title">
            {song.songTitle || song.title || "Unknown Title"}
          </div>
          <div className="cart-list-item-license">
            {song.license || "Unknown License"}
          </div>
          {song.username &&
          <Link to={`/producer/${song.userId}`} className="producer-link">
          by{". "} {song.username }
          </Link>}
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
          onClick={() => handleDeleteCartItem(song.id || song.songId)}
        >
          x
        </button>
      </div>
    </li>
  );
}

/* =======================
   CART COMPONENT
======================= */
export default function CartComponent() {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const userCountry = useUserLocation();
  const [exchangeRate, setExchangeRate] = useState(null);
  const [cart, setCart] = useState([]);
  const [beatsMap, setBeatsMap] = useState({}); // stores beat info keyed by songId

  /* =======================
     FETCH EXCHANGE RATE
  ======================= */
  useEffect(() => {
    if (userCountry === "NG") {
      getExchangeRate()
        .then(setExchangeRate)
        .catch(() => setExchangeRate(null));
    }
  }, [userCountry]);

  /* =======================
     REALTIME CART (LATEST FIRST)
  ======================= */
  useEffect(() => {
    // Guest cart
    if (!user) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(localCart.reverse());
      return;
    }

    const cartRef = collection(db, "beatHubUsers", user.uid, "cart");
    const q = query(cartRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCart(items);
      },
      (error) => {
        console.error("Realtime cart error:", error);
      }
    );

    return () => unsubscribe();
  }, [user, db]);

  /* =======================
     FETCH BEATS INFO
     Join beats collection for latest title, coverUrl, producer
  ======================= */
  useEffect(() => {
    if (cart.length === 0) return;

    const fetchBeats = async () => {
      const beatsData = {};
      await Promise.all(
        cart.map(async (item) => {
          if (!beatsData[item.songId]) {
            const beatSnap = await getDoc(doc(db, "beats", item.songId));
            if (beatSnap.exists()) {
              beatsData[item.songId] = beatSnap.data();
            }
          }
        })
      );
      setBeatsMap(beatsData);
    };

    fetchBeats();
  }, [cart, db]);

  /* =======================
     DELETE CART ITEM
  ======================= */
  const handleDeleteCartItem = async (cartItemId) => {
    if (user) {
      try {
        // Delete from user cart
        await deleteDoc(doc(db, "beatHubUsers", user.uid, "cart", cartItemId));
  
        // Delete from global cart using the same ID
        await deleteDoc(doc(db, "Cart", cartItemId));
  
        // Update local state
        setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    } else {
      // Guest cart deletion
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updated = localCart.filter(
        (i) => i.songId !== cartItemId && i.id !== cartItemId
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      setCart(updated.reverse());
    }
  };

  /* =======================
     UPGRADE PRICE (ONCE)
  ======================= */
  const { itemizedCart, loading, error } = useUpgradePrice({
    email: user?.email || null,
    uid: user?.uid || null,
    cart,
    selectedLicense: null,
  });

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="cart-Component-wrapper">
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ol className="cart-component-list">
        {cart.map((item) => {
          const beat = beatsMap[item.songId] || {};          // get beat info
          const combinedItem = { ...item, ...beat };         // merge beat info into cart item
      
          // Get originalPrice from beat.monetization using the license
          const licenseName = item.license;                  // license chosen in cart
          const licenseKey = licenseName.split(" ")[0].toLowerCase();
          const originalPrice = beat.monetization?.[licenseKey]?.price || 0;          
      
          // displayPrice uses upgradePrice if available
          const upgrade = itemizedCart.find(u => u.beatId === item.songId);
          const displayPrice = upgrade?.finalPrice ?? originalPrice;
      
          return (
            <CartItem
              key={item.id}
              song={combinedItem}
              displayPrice={displayPrice}
              originalPrice={originalPrice}
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