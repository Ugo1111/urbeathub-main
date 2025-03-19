import React, { useState, useEffect } from "react";
import "../css/addToCart.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import CartComponent from "../component/CartComponent.js";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";

function CartPage() {
    const [cart, setCart] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        // Listen for auth state changes (ensures auth.currentUser is set)
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setCart([]); // Clear cart if no user
                setLoading(false); // Stop loading
                return;
            }

            // Fetch cart data when user is available
            try {
                const userRef = doc(db, "beatHubUsers", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setCart(userSnap.data().cart || []);
                } else {
                    setCart([]); // No cart data found
                }
            } catch (error) {
                console.error("Error fetching cart data:", error);
            } finally {
                setLoading(false); // Ensure loading stops
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // **Total price calculation**
    const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

    return (
        <div className="CheckoutContainer">
            <GroupA />
            <h1 className="CheckoutTitle">Cart</h1>
            <div className="CheckoutBody">
                <div className="checkoutItem">
                    <CartComponent cart={cart} setCart={setCart} />
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
                                        <div className="certSummaryPRICE">${song.price || "0.00"}</div>
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

                        <button onClick={() => window.location.href = "https://paystack.com/pay/ur-beathub"} className="proceedToCheckout">Proceed to Checkout</button>
                        <div>You are checking out as @{user?.displayName || "Guest"}, not you?</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;