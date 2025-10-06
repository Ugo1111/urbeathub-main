import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/addToCart.css";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/PaystackPayment";
import { useUpgradePrice } from "../component/UpgradePrice.js";
import djImage from '../../images/dj.jpg';
import StripeWrapper from "../component/StripeWrapper";
import { Helmet } from "react-helmet-async";
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";

function CheckoutPage() {
  const userCountry = useUserLocation(); 
  const [exchangeRate, setExchangeRate] = useState(null);

  const location = useLocation();
  const { item, selectedSong, selectedLicense } = location.state || {};
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");

  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  // Fetch exchange rate if in NG
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

  // Load user or guest cart
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) setUserEmail(currentUser.email);

      if (!currentUser || item) {
        setCart(item ? [item] : []);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "beatHubUsers", currentUser.uid);
        const userSnap = await getDoc(userRef);
        setCart(userSnap.exists() ? userSnap.data().cart || [] : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [item]);

  const parsePrice = (price) => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount) usdAmount = 0;
    if (userCountry === "NG" && exchangeRate) {
      return `₦${Math.round(usdAmount * exchangeRate).toLocaleString()}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const totalPrice = parsePrice(selectedLicense?.price);

  // Build lean cart
  const leanCart = cart.map(item => {
    const licenseKey = (selectedLicense?.name || "Basic License").toLowerCase().replace(" license", "");
    const price = item.monetization?.[licenseKey]?.price || 0;
    return {
      beatId: item.id,
      license: selectedLicense?.name || "Basic License",
      price,
    };
  });

  // Itemized display for strike-through logic
  const { upgradePrice, itemizedCart = [] } = useUpgradePrice({
    email: userEmail,
    uid: user?.uid || "guest",
    cart,
    selectedLicense,
  });

  const displayCart = cart.map(song => {
    const licenseKey = (selectedLicense?.name || "Basic License").toLowerCase().replace(" license", "");
    const originalPrice = song.monetization?.[licenseKey]?.price || parsePrice(selectedLicense?.price);
    const displayPrice = upgradePrice !== null ? upgradePrice : originalPrice;

    return {
      ...song,
      beatId: song.id,
      license: selectedLicense?.name || "Basic License",
      originalPrice,
      displayPrice,
    };
  });

  return (
    <div>
      <Helmet>
        <title>Payment | Cart Checkout</title>
      </Helmet>

      <div className="CheckoutContainer">
        <GroupA />
        <h1 className="CheckoutTitle">Checkout</h1>
        <div className="CheckoutBody">
          <div className="checkoutItem">
            {loading ? (
              <p>Loading cart...</p>
            ) : cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              displayCart.map((song, i) => (
                <div key={i} className="cart-list-item">
                  <div className="cart-list-info">
                    <img src={selectedSong.coverUrl || djImage} className="cart-list-image" alt="Song Cover" />
                    <div className="cart-list-item-title-license">
                      <div className="cart-list-item-title">{selectedSong.title || "Unknown Title"}</div>
                      <div className="cart-list-item-license">{selectedLicense?.name || "Unknown License"}</div>
                    </div>
                  </div>
                  <div className="cart-list-actions">
                    <div className="cart-list-price">
                      {song.displayPrice !== song.originalPrice ? (
                        <>
                          {formatPrice(song.displayPrice)}
                          <span style={{ textDecoration: "line-through", color: "gray", marginLeft: "8px" }}>
                            {formatPrice(song.originalPrice)}
                          </span>
                        </>
                      ) : (
                        formatPrice(song.originalPrice)
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="CartSection2">
            <div className="CartSummary">
              <h3>Checkout Summary</h3>
              {displayCart.map((song, i) => (
                <div key={i} className="selectedCartSummary">
                  <div className="certSummarySong">Items Total</div>
                  <div className="certSummaryPRICE">{formatPrice(parsePrice(selectedLicense?.price))}</div>
                </div>
              ))}

              {location.state?.isUpgrade && location.state?.ownedLicensePrice !== undefined && (
                <div className="UpgradeDeduction">
                  <div>Upgrade deduction</div>
                  <div>- {formatPrice(parsePrice(location.state.ownedLicensePrice))}</div>
                </div>
              )}

              <div className="Total_CartSummary">
                <hr />
                <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                <h3>{upgradePrice !== null ? formatPrice(upgradePrice) : formatPrice(totalPrice)}</h3>
              </div>

              {/* Step 1: Guest Email Input and Continue */}
{!userEmail && !emailConfirmed && (
  <div className="guest-email-section">
    <label>Please enter your email to continue as a guest:</label>
    <input
      type="email"
      placeholder="Enter your email"
      value={guestEmail}
      onChange={(e) => setGuestEmail(e.target.value)}
    />
    <br />
    <button
      onClick={() => {
        const emailRegex = /^[^\s@]+@[^\s@]{2,}\.[^\s@]{2,}$/;
        if (!guestEmail || !emailRegex.test(guestEmail)) {
          alert("Please enter a valid email to continue as a guest.");
          return;
        }
        alert(`You are checking out with email: ${guestEmail} your beat will be sent to this email`);
        setEmailConfirmed(true); // ✅ now show payment buttons
        setUserEmail(guestEmail); // set userEmail for payment
      }}
    >
      Continue
    </button>
  </div>
)}

{/* Step 2: Payment Buttons (show if logged in OR guest confirmed email) */}
{(userEmail || emailConfirmed) && cart.length > 0 && (
  <>
    {userCountry === "NG" ? (
      <PaystackPayment
        email={userEmail}
        amount={upgradePrice !== null ? upgradePrice : totalPrice}
        song={selectedSong?.title}
        beatId={selectedSong?.id}
        license={selectedLicense?.name}
        uid={user?.uid || "guest"}
        cart={leanCart}
      />
    ) : (
      <StripeWrapper
        amount={upgradePrice !== null ? upgradePrice : totalPrice}
        email={userEmail}
        onSuccess={() => alert("Payment Successful!")}
        onError={(err) => alert("Payment failed: " + err)}
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
    </div>
  );
}

export default CheckoutPage;