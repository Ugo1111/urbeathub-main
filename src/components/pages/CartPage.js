import React, { useState, useEffect } from "react";
import "../css/addToCart.css";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
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

    // Remove already purchased items and merge carts
    useEffect(() => {
        const fetchCart = async () => {
            let currentUser = auth.currentUser;
            setUser(currentUser);

            let mergedCart = [];
            let purchasedBeatIds = [];

            if (currentUser) {
                setUserEmail(currentUser.email);
                const userRef = doc(db, "beatHubUsers", currentUser.uid);

                // Get Firestore cart
                const userSnap = await getDoc(userRef);
                const firestoreCart = userSnap.exists() ? userSnap.data().cart || [] : [];

                // Get purchased beats
                const purchasesRef = collection(db, `beatHubUsers/${currentUser.uid}/purchases`);
                const purchasesSnapshot = await getDocs(purchasesRef);
                purchasedBeatIds = purchasesSnapshot.docs.map(doc => doc.data().beatId);

                // Get local cart
                const localCartRaw = localStorage.getItem("cart");
                const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];

                // Merge carts, remove duplicates, filter already purchased
                mergedCart = [
                    ...firestoreCart,
                    ...localCart.filter(
                        (item) =>
                            !firestoreCart.some(
                                (fItem) =>
                                    fItem.songId === item.songId &&
                                    fItem.license === item.license
                            )
                    ),
                ].filter(item => !purchasedBeatIds.includes(item.songId || item.beatId));

                // Save merged cart
                await updateDoc(userRef, { cart: mergedCart });
                localStorage.removeItem("cart"); // clear local cart
            } else {
                // Guest: filter out purchased beats if stored somewhere (optional)
                const localCartRaw = localStorage.getItem("cart");
                const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
                mergedCart = localCart.filter(item => !purchasedBeatIds.includes(item.songId || item.beatId));
                localStorage.setItem("cart", JSON.stringify(mergedCart));
            }

            setCart(mergedCart);
            setLoading(false);
        };

        fetchCart();
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