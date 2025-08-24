import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/addToCart.css";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/CheckoutPaystackPayment";
import {useUpgradePrice} from "../component/UpgradePrice.js";
// import StripeCheckout from "../component/StripeCheckoutForm";
import { Link } from "react-router-dom";
import djImage from '../../images/dj.jpg';
import StripeWrapper from "../component/StripeWrapper";
import { Helmet } from "react-helmet-async";
// import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// function StripePayment({ amount, email, onSuccess }) {
//     const stripe = useStripe();
//     const elements = useElements();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const handlePayment = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             // Call the backend to create a payment intent
//             const response = await fetch("/createPaymentIntent", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ amount, email }),
//             });

//             const { clientSecret } = await response.json();

//             if (!clientSecret) {
//                 throw new Error("Failed to retrieve client secret.");
//             }

//             // Confirm the payment using the client secret
//             const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//                 payment_method: {
//                     card: elements.getElement(CardElement),
//                     billing_details: { email },
//                 },
//             });

//             if (error) {
//                 setError(error.message);
//             } else if (paymentIntent.status === "succeeded") {
//                 onSuccess(paymentIntent);
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handlePayment}>
//             <CardElement />
//             <button type="submit" disabled={loading}>
//                 {loading ? "Processing..." : `Pay $${amount}`}
//             </button>
//             {error && <div>{error}</div>}
//         </form>
//     );
// }

function CheckoutPage() {
    const [userCountry, setUserCountry] = useState(null);
    const location = useLocation();
    const { item, selectedSong, selectedLicense } = location.state || {};
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userEmail, setUserEmail] = useState(null); // State to store the email
    const [paymentError, setPaymentError] = useState(null);
    const { upgradePrice, loading: priceLoading, error: priceError } = useUpgradePrice({
        email: userEmail,
        uid: user?.uid,
        cart,
        selectedLicense,
      });

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        // Check for cached country in sessionStorage
        const cachedCountry = sessionStorage.getItem("userCountry");
        if (cachedCountry) {
            setUserCountry(cachedCountry);
            return;
        }
        async function fetchCountry() {
            try {
                const response = await fetch("https://ipapi.co/json/");
                if (!response.ok) throw new Error("Failed to fetch country");
                const data = await response.json();
                setUserCountry(data.country_code); // e.g., "NG"
                sessionStorage.setItem("userCountry", data.country_code);
            } catch (error) {
                console.error("Could not get user country:", error);
                setUserCountry(null);
            }
        }
        fetchCountry();
    }, []);



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setUserEmail(currentUser.email); // Set user email when user is authenticated
            }

            if (!currentUser || item) {
                setCart(item ? [item] : []);
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "beatHubUsers", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setCart(userSnap.data().cart || []);
                } else {
                    setCart([]);
                }
            } catch (error) {
                console.error("Error fetching cart data:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [item]);

    useEffect(() => {
        const fetchMonetizationData = async () => {
            try {
                const updatedCart = await Promise.all(cart.map(async (song) => {
                    const beatId = song.beatId || song.songId || song.id;
                  
                    if (!beatId) {
                      console.warn("❌ Missing beatId/songId in cart item:", song);
                      return song; // skip this item
                    }
                  
                    const beatRef = doc(db, "beats", beatId);
                    const beatSnap = await getDoc(beatRef);
                  
                    if (beatSnap.exists()) {
                      const beatData = beatSnap.data();
                      const monetization = beatData.monetization || {};
                  
                      return {
                        ...song,
                        license: song.license || monetization?.name || "Unknown License",
                        price: monetization?.license?.price || "0.00",
                      };
                    }
                    return song;
                  }));

                setCart(updatedCart);
            } catch (error) {
                console.error("Error fetching monetization data:", error);
            }
        };

        if (cart.length > 0) {
            fetchMonetizationData();
        }
    }, [JSON.stringify(cart.map(song => song.songId || song.id))]);

    const cleanPrice = selectedLicense?.price?.replace(/[^0-9.]/g, ""); // Removes any non-numeric characters
    const totalPrice = Number(cleanPrice) || 0;

    const handlePaymentSuccess = (paymentIntent) => {
        console.log("Payment successful:", paymentIntent);
        alert("Payment successful!");
        // Handle post-payment actions (e.g., save order details to the database)
    };

    const handlePaymentError = (errorMessage) => {
        setPaymentError(errorMessage);
    };

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
                            <>
                                {cart.map((song, index) => (
                                    <div key={index} className="cart-list-item">
                                        <div className="cart-list-info">
                                            <img
                                                src={selectedSong.coverUrl || djImage}
                                                className="cart-list-image"
                                                alt="Song Cover"
                                            />
                                            <div className="cart-list-item-title-license">
                                                <div className="cart-list-item-title">{selectedSong.title || "Unknown Title"}</div>
                                                <div className="cart-list-item-license">{selectedLicense?.name || "Unknown License"}</div>
                                            </div>
                                        </div>
                                        <div className="cart-list-actions">
                                            <div className="cart-list-price">{selectedLicense?.price || "0.00"}</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <br />

                    <div className="CartSection2">
                        <div className="CartSummary">
                            <h2>Cart Summary</h2>
                            {loading ? (
                                <p>Loading cart...</p>
                            ) : cart.length === 0 ? (
                                <p>Your cart is empty.</p>
                            ) : (
                                <>
                                    {cart.map((song, index) => (
                                        <div key={index} className="selectedCartSummary">
                                            <div className="certSummarySong">{selectedSong?.title || "Untitled Song"}</div>
                                            <div className="certSummaryPRICE">{selectedLicense?.price || "0.00"}</div>
                                        </div>
                                    ))}
                                    {/* <div className="Subtotal">
                                    <div>Subtotal</div>
                                    <div>${totalPrice}</div>
                                    </div> */}
                                    {/* Upgrade deduction display */}
                                    {location.state?.isUpgrade && location.state?.ownedLicensePrice !== undefined && (
                                        <div className="UpgradeDeduction">
                                            <div>Upgrade deduction</div>
                                            <div>- ${Number(location.state.ownedLicensePrice).toFixed(2)}</div>
                                        </div>
                                    )}
                                    <div className="Total_CartSummary">
                                        <hr />

                                        <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                                        <h3>
                                        {upgradePrice !== null ? `$${upgradePrice.toFixed(2)}` : `$${totalPrice.toFixed(2)}`}                                        </h3>
                                    </div>
                                </>
                            )}
                          {userEmail ? (
  <>



    {/* USE "userCountry === "GB" || userCountry === "UK" ? " TO TEST UK */}

    {userCountry === "NG" ? (
      <PaystackPayment
        email={userEmail}
        amount={
            upgradePrice !== null ? upgradePrice : totalPrice
          }
        song={selectedSong?.title}
        beatId={selectedSong?.id}
        license={selectedLicense?.name}
        uid={user?.uid}
        cart={cart}
        setCart={setCart}
      />
    ) : (
      <StripeWrapper
      amount={
        upgradePrice !== null ? upgradePrice : totalPrice
      }
        email={userEmail}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        license={selectedLicense?.name}
        song={selectedSong?.title}
        uid={user?.uid}
        beatId={selectedSong?.id}
        // setFinalAmount={setFinalAmount}
      />
    )}
    {paymentError && (
      <div style={{ color: "red", marginTop: "0.5rem", fontSize: "0.95rem" }}>
        {paymentError}
      </div>
    )}
  </>
) : (
  // existing guest checkout button code
  <Link
    to="/CheckoutpaymentPage"
    state={{
      totalPrice,
      userEmail,
      song: selectedSong?.title,
      license: selectedLicense?.name,
      beatId: selectedSong?.id,
    }}
  >
    {/* <button className="buy-now-btn">Proceed to Checkout</button> */}
  </Link>
)}
                            <div>
                                You are checking out {userEmail ? `with email: ${userEmail}` : "as a Guest"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
