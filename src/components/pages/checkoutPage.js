import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css/addToCart.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import CheckoutComponent from "../component/CheckoutComponent.js";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";

function CheckoutPage() {
    const location = useLocation();
    const selectedSong = location.state?.selectedSong; // Get the selected song from Link state

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser || selectedSong) {
                setCart(selectedSong ? [selectedSong] : []);
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
    }, [selectedSong]);

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
                            license: monetization?.basic?.name || "Unknown License",
                            price: monetization?.basic?.price || "0.00",
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

    useEffect(() => {
        console.log("Cart items:", cart);
    }, [cart]);

    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

    return (
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
                                            src={song.coverUrl || "./images/default-cover.jpg"}
                                            className="cart-list-image"
                                            alt="Song Cover"
                                        />
                                        <div className="cart-list-item-title-license">
                                            <div className="cart-list-item-title">{song.title || "Unknown Title"}</div>
                                            <div className="cart-list-item-license">{song.license || "Unknown License"}</div>
                                        </div>
                                    </div>
                                    <div className="cart-list-actions">
                                        <div className="cart-list-price">${song.price || "0.00"}</div>
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
                                        <div className="certSummarySong">{song.title || "Untitled Song"}</div>
                                        <div className="certSummaryPRICE">${  `$${song.monetization.premium.price}` || "0.00"}</div>
                                    </div>
                                ))}
                                <hr />
                                <div className="Subtotal">
                                    <div>Subtotal</div>
                                    <div>${totalPrice.toFixed(2)}</div>
                                </div>
                                <div className="Total_CartSummary">
                                    <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                                    <h3>${totalPrice.toFixed(2)}</h3>
                                </div>
                            </>
                        )}

                        <button 
                            onClick={() => window.location.href = "https://paystack.com/pay/ur-beathub"} 
                            className="proceedToCheckout">
                            Proceed to Checkout
                        </button>
                        <div>You are checking out as @{user?.displayName || "Guest"}, not you?</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;