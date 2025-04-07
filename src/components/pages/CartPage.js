import React, { useState, useEffect } from "react";
import "../css/addToCart.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import CartComponent from "../component/CartComponent.js";
import GroupA from "../component/header.js";
import PaystackPayment from "../component/PaystackPayment";
import { GroupE, GroupF, GroupG } from "../component/footer.js";


function CartPage() {
    const [cart, setCart] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userEmail, setUserEmail] = useState(null); // State to store the email
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setUserEmail(currentUser.email); // Set user email when user is authenticated
            }

            if (!currentUser) {
                setCart([]);
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
    }, [auth, db]);

    // Calculate total price using reduce()
    const totalPrice = cart.reduce((acc, song) => {
        const cleanPrice = song.price?.replace(/[^0-9.]/g, ""); // Removes any non-numeric characters
        const itemPrice = Number(cleanPrice) || 0;
        return acc + itemPrice;
    }, 0);

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
                                        <div className="certSummaryPRICE">{song.price || "0.00"}</div>
                                    </div>
                                ))}
                                <hr />
                                <div className="Subtotal">
                                    <div>Subtotal</div>
                                    <div>${totalPrice.toFixed(2)}</div> {/* Reflect correct subtotal */}
                                </div>
                                <div className="Total_CartSummary">
                                    <h3>Total ({cart.length} item{cart.length !== 1 ? "s" : ""})</h3>
                                    <h3>${totalPrice.toFixed(2)}</h3> {/* Reflect correct total */}
                                </div>
                            </>
                        )}

                        {userEmail ? (
                            <PaystackPayment
                                email={userEmail}
                                amount={totalPrice}
                                song={cart[0]?.title}
                                beatId={cart[0]?.songId}
                                license={cart[0]?.license}
                                uid={user?.uid} // Pass the user ID
                                cart={cart} // Pass the entire cart
                                setCart={setCart} // Pass the setCart function
                            />
                        ) : (
                            <Link to="/paymentPage" state={{ totalPrice, userEmail }}>
                                <button className="buy-now-btn">Proceed to Checkout</button>
                            </Link>
                        )}
                        <div>
                            You are checking out {userEmail ? `with email: ${userEmail}` : "as a Guest"} 
                             {/* or <Link to="/paymentPage" state={{ totalPrice, userEmail }}>
                                                            <div >click here to checkout with a different Email</div> </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;