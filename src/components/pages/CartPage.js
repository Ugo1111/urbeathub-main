import React, { useState, useEffect } from "react";
import "../css/addToCart.css";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CartComponent from "../component/CartComponent.js";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/PaystackPayment";
import StripeWrapper from "../component/StripeWrapper";
import BeatsList from "../component/searchComponent.js";
import { Helmet } from "react-helmet-async";
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";
import { useUpgradePrice } from "../component/UpgradePrice.js";

function CartPage() {
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const userCountry = useUserLocation();

  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [cart, setCart] = useState([]);
  const [beatsMap, setBeatsMap] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =======================
     AUTH LISTENER + MERGE GUEST CART
  ======================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setUserEmail(currentUser.email);
        const userCartRef = collection(db, "beatHubUsers", currentUser.uid, "cart");

        try {
          // 1️⃣ Fetch guest cart
          const localCartRaw = localStorage.getItem("cart");
          const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];

          // 2️⃣ Fetch Firestore user cart
          const q = query(userCartRef, orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          const firestoreCart = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // 3️⃣ Merge
          const mergedCart = [
            ...firestoreCart,
            ...localCart.filter(
              item => !firestoreCart.some(f => f.songId === item.songId && f.license === item.license)
            )
          ];

          // 4️⃣ Optionally save merged cart
          for (const item of mergedCart) {
            if (!firestoreCart.find(f => f.songId === item.songId && f.license === item.license)) {
              await updateDoc(doc(db, "beatHubUsers", currentUser.uid), { cart: mergedCart });
            }
          }

          // 5️⃣ Clear localStorage
          localStorage.removeItem("cart");

          setCart(mergedCart);
        } catch (err) {
          console.error("Error merging cart:", err);
          setCart([]);
        }
      } else {
        // Guest cart
        const localCartRaw = localStorage.getItem("cart");
        const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
        setCart(localCart);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  /* =======================
     FETCH EXCHANGE RATE
  ======================= */
  useEffect(() => {
    if (userCountry === "NG") {
      getExchangeRate().then(setExchangeRate).catch(() => setExchangeRate(null));
    }
  }, [userCountry]);

  /* =======================
     FETCH BEATS INFO
     Join beats collection for latest title, coverUrl, producer
  ======================= */
  useEffect(() => {
    if (cart.length === 0) return;

    const fetchBeats = async () => {
      const beatsData = {};
      await Promise.all(
        cart.map(async item => {
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
     UPGRADE PRICES
  ======================= */
  const { upgradePrice, itemizedCart, loading: upgradeLoading, error: upgradeError } = useUpgradePrice({
    email: userEmail,
    uid: user?.uid,
    cart,
    selectedLicense: null
  });

  const formatPrice = usdAmount => {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "NG" && exchangeRate) return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    return `$${usdAmount.toFixed(2)}`;
  };

  const parsePrice = price => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  /* =======================
     CALCULATE SUBTOTAL FROM BEATS INFO
  ======================= */
  const subtotal = cart.reduce((acc, item) => {
    const beat = beatsMap[item.songId] || {};
    const licenseKey = item.license?.split(" ")[0].toLowerCase();
    const price = beat.monetization?.[licenseKey]?.price || 0;
    return acc + price;
  }, 0);

  const finalTotal = upgradePrice !== null ? upgradePrice : subtotal;
  const deduction = subtotal - finalTotal;

  /* =======================
     PREPARE CART FOR PAYMENT
  ======================= */
  const leanCart = cart.map(item => {
    const beat = beatsMap[item.songId] || {};
    const licenseKey = item.license?.split(" ")[0].toLowerCase();
    const price = beat.monetization?.[licenseKey]?.price || "loading... ";
    return {
      beatId: item.songId,
      license: item.license,
      price: price
    };
  });

  return (
    <>
      <Helmet><title>Cart Page</title></Helmet>
      <div className="CheckoutContainer">
        <GroupA />
        <div className="mobile-only-search"><BeatsList /></div>
        <h1 className="CheckoutTitle">Cart</h1>

        <div className="CheckoutBody">
          <div className="checkoutItem">
            <CartComponent
              cart={cart}
              setCart={setCart}
              itemizedCart={itemizedCart}
              upgradeLoading={upgradeLoading}
              upgradeError={upgradeError}
              exchangeRate={exchangeRate}
              userCountry={userCountry}
            />
          </div>

          <div className="CartSection2">
            <div className="CartSummary">
              <h2>Cart Summary</h2>
              <h3>Item{cart.length !== 1 ? "s" : ""} ({cart.length})</h3>
              <h3>{formatPrice(subtotal)}</h3>

              <hr />
              <div className="Subtotal">
                <div>Subtotal</div>
                <div>{formatPrice(subtotal)}</div>
              </div>

              {deduction > 0 && (
                <div className="UpgradeDeduction">
                  <div>Upgrade Deduction</div>
                  <div>- {formatPrice(deduction)}</div>
                </div>
              )}

              <div className="Total_CartSummary">
                <h3>Total</h3>
                <h3>
                  {upgradeLoading
                    ? "Calculating..."
                    : upgradeError
                    ? <span style={{ color: "red" }}>{upgradeError}</span>
                    : formatPrice(finalTotal)
                  }
                </h3>
              </div>

              {/* Guest Email Input */}
              {!user && !emailConfirmed && cart.length > 0 && (
                <div className="guest-email-section">
                  <label>Please enter your email to continue as a guest:</label>
                  <input
                    type="email"
                    className="guest-email-input"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  <br />
                  <button
                    className="guest-btn"
                    onClick={() => {
                      const emailRegex = /^[^\s@]+@[^\s@]{2,}\.[^\s@]{2,}$/;
                      if (!guestEmail || !emailRegex.test(guestEmail)) {
                        alert("Please enter a valid email.");
                        return;
                      }
                      alert(`You are checking out with email: ${guestEmail}`);
                      setEmailConfirmed(true);
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Payment Buttons */}
              {cart.length > 0 && (userEmail || emailConfirmed) && (
                <>
                  {userCountry === "NG" ? (
                    <PaystackPayment
                      email={userEmail || guestEmail}
                      amount={finalTotal}
                      uid={user?.uid || "guest"}
                      cart={leanCart}
                    />
                  ) : (
                    <StripeWrapper
                      amount={finalTotal}
                      email={userEmail || guestEmail}
                      onSuccess={() => alert("Payment Successful!")}
                      onError={err => alert("Payment failed: " + err)}
                      uid={user?.uid || "guest"}
                      cart={leanCart}
                    />
                  )}
                </>
              )}

              <div>
                You are checking out {userEmail || guestEmail ? `with email: ${userEmail || guestEmail}` : "as a Guest"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;