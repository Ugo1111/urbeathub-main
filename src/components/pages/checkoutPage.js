import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../css/addToCart.css";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/CheckoutPaystackPayment";
import { Link } from "react-router-dom";
import djImage from '../../images/dj.jpg';

import { Helmet } from 'react-helmet';

function CheckoutPage() {
    const location = useLocation();
    const { item, selectedSong, selectedLicense } = location.state || {};
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userEmail, setUserEmail] = useState(null); // State to store the email

    const auth = getAuth();
    const db = getFirestore();

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
                    const beatRef = doc(db, "beats", song.songId);
                    const beatSnap = await getDoc(beatRef);

                    if (beatSnap.exists()) {
                        const beatData = beatSnap.data();
                        const monetization = beatData.monetization || {};

                        return {
                            ...song,
                            license: song.license || monetization?.name || "Unknown License",
                            price: monetization?.license.price || "0.00",
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
    }, [cart]);

    const cleanPrice = selectedLicense?.price?.replace(/[^0-9.]/g, ""); // Removes any non-numeric characters
    const totalPrice = Number(cleanPrice) || 0;

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
                                <hr />
                                <div className="Subtotal">
                                    <div>Subtotal</div>
                                    <div>${totalPrice}</div>
                                </div>
                                <div className="Total_CartSummary">
                                    <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                                    <h3>${totalPrice}</h3>
                                </div>
                            </>
                        )}
                        {userEmail ? (
                            <PaystackPayment
                                email={userEmail}
                                amount={totalPrice}
                                song={selectedSong?.title}
                                beatId={selectedSong?.id}
                                license={selectedLicense?.name}
                                uid={user?.uid} // Pass the user ID
                                cart={cart} // Pass the cart
                                setCart={setCart} // Pass the setCart function
                            />
                        ) : (
                            <Link to="/CheckoutpaymentPage" state={{ totalPrice, userEmail, song: selectedSong?.title, license: selectedLicense?.name, beatId: selectedSong?.id }}>
                                <button className="buy-now-btn">Proceed to Checkout</button>
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
