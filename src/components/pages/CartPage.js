import React, { useState, useEffect } from "react";
import "../css/addToCart.css";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CartComponent from "../component/CartComponent.js";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/PaystackPayment";
import { Helmet } from "react-helmet-async";
import { getExchangeRate } from "../utils/exchangeRate";
import { useUserLocation } from "../utils/useUserLocation";
import { useUpgradePrice } from "../component/UpgradePrice.js";
import StripeWrapper from "../component/StripeWrapper";

function CartPage() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);
    const userCountry = useUserLocation();
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();
    const [guestEmail, setGuestEmail] = useState("");
    const [emailConfirmed, setEmailConfirmed] = useState(false);


    // Listen for auth state changes
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
            setUserEmail(currentUser.email);
            const userRef = doc(db, "beatHubUsers", currentUser.uid);

            try {
                // 1️⃣ Get localStorage cart
                const localCartRaw = localStorage.getItem("cart");
                const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];

                // 2️⃣ Fetch Firestore cart
                const userSnap = await getDoc(userRef);
                const firestoreCart = userSnap.exists() ? userSnap.data().cart || [] : [];

                // 3️⃣ Merge carts (avoid duplicates)
                const mergedCart = [
                    ...firestoreCart,
                    ...localCart.filter(
                        (localItem) =>
                            !firestoreCart.some(
                                (fItem) =>
                                    fItem.songId === localItem.songId &&
                                    fItem.license === localItem.license
                            )
                    ),
                ];

                // 4️⃣ Save merged cart to Firestore
                if (mergedCart.length > 0) {
                    await updateDoc(userRef, { cart: mergedCart });
                }

                // 5️⃣ Clear localStorage cart
                localStorage.removeItem("cart");

                // 6️⃣ Set merged cart to state
                setCart(mergedCart);
            } catch (error) {
                console.error("Error merging local cart:", error);
                setCart([]);
            }
        } else {
            // Load guest's localStorage cart
            const localCartRaw = localStorage.getItem("cart");
            const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
            setCart(localCart);  // Display local cart for guest
        }

        setLoading(false);
    });

    return () => unsubscribe();
}, [auth, db]);

    // Fetch exchange rate for NGN conversion
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

    // Use UpgradePrice hook for the whole cart
    const { upgradePrice, itemizedCart, loading: upgradeLoading, error: upgradeError } = useUpgradePrice({
        email: userEmail,
        uid: user?.uid,
        cart,
        selectedLicense: null,
    });

    // Build lean cart for Paystack
    const leanCart = cart.map(item => {
        const itemUpgrade = itemizedCart.find(u => u.beatId === item.id || u.beatId === item.songId);
        return {
            beatId: item.id || item.songId,
            license: item.license,
            price: itemUpgrade?.finalPrice || parsePrice(item.price),
        };
    });

    const subtotal = cart.reduce((acc, item) => acc + parsePrice(item.price), 0);
    const finalTotal = upgradePrice !== null ? upgradePrice : subtotal;
    const deduction = subtotal - finalTotal;

    return (
        <>
            <Helmet>
                <title>Cart Page</title>
            </Helmet>
            <div className="CheckoutContainer">
                <GroupA />
                <h1 className="CheckoutTitle">Cart</h1>
                <div className="CheckoutBody">
                    <div className="checkoutItem">
                        <CartComponent
                           cart={cart}
                           setCart={setCart}
                           itemizedCart={itemizedCart}     // ✅ Pass itemized prices
                           upgradeLoading={upgradeLoading} // ✅ Pass loading state
                           upgradeError={upgradeError}     // ✅ Pass errors
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
                                <h3>Total </h3>
                                <h3>
                                    {upgradeLoading
                                        ? "Calculating..."
                                        : upgradeError
                                            ? <span style={{ color: "red" }}>{upgradeError}</span>
                                            : formatPrice(finalTotal)
                                    }
                                </h3>
                            </div>

{/* Step 1: Input and Continue */}
{!user && !emailConfirmed && cart.length > 0 && (
  <div className="guest-email-section">
    <label>Please enter your email to continue as a guest:</label>
    <input
      type="email"
      value={guestEmail}
      onChange={(e) => setGuestEmail(e.target.value)}
      placeholder="Enter your email"
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
        setEmailConfirmed(true); // ✅ show payment button
      }}
    >
      Continue
    </button>
  </div>
)}

{/* Step 2: Payment buttons (only show if user logged in OR guest confirmed email) */}
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
        </>
    );
}

export default CartPage;