import React from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/checkout.css";
import djImage from '../../images/dj.jpg';

function CartComponent({ cart, setCart }) {  // Receive cart & setCart as props
    const auth = getAuth();
    const db = getFirestore();

    const handleDeleteCartItem = async (songId) => {
        if (!auth.currentUser) return;

        const userRef = doc(db, "beatHubUsers", auth.currentUser.uid);

        try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const updatedCart = userData.cart.filter((item) => item.songId !== songId);

            // Update Firestore
            await updateDoc(userRef, { cart: updatedCart });

            // **Update state immediately**
            setCart(updatedCart);
        } catch (error) {
            console.error("Error deleting cart item:", error);
        }
    };

    return (
        <div className="cart-Component-wrapper">
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ol className="cart-component-list">
                    {cart.map((song) => (
                        <li key={song.songId} className="cart-list-item">
                            <div className="cart-list-info">
                                <img
                                    src={song.coverUrl || djImage}
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
                                <button className="cart-list-remove-btn" onClick={() => handleDeleteCartItem(song.songId)}>
                                    x
                                </button>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

export default CartComponent;