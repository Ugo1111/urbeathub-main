import React from "react";
import "../css/addToCart.css";

import { useLocation } from "react-router-dom";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";

function CartPage() {
    const location = useLocation();
    const cart = location.state?.cart || []; // Get cart data passed through location state

    const handleRemoveFromCart = (index) => {
        // Remove a song from the cart
        const newCart = [...cart];
        newCart.splice(index, 1);
        // Update state (this would be handled via a global state or context)
    };

    const handleCheckout = () => {
        // Logic for checkout (e.g., redirecting to a payment page)
        alert('Proceeding to checkout...');
    };

    return (
<div className="CheckoutContainer">
            <GroupA />
            
            <h1 className="CheckoutTitle">Checkout</h1>
            <div className="CheckoutBody">
                
                <div className="checkoutItem"></div>
                <br></br>
                <div className="CartSection2">
                    <div className="CartSummary">
                    <h2 className="">Cart Summary</h2>
                    <div className="selectedCartSummary">
                        <div className="certSummarySong">Rob EVN</div>
                        <div className="certSummaryPRICE">$49.99</div>
                    </div>
                    <hr></hr>
                    <div className="Subtotal">
                        <div className="">Subtotal</div>
                        <div className="">$49.99</div>
                    </div>
                    <div className="Total_CartSummary">
                        <h3 className="">Total (1 item)</h3>
                        <h3 className="">$49.99</h3>
                    </div>

                     <button className="proceedToCheckout">proceed to Checkout</button>


                    <div className="">You are checking out as @dirleeugo not you? </div>
 
                </div>
                </div>
            </div>
            </div>
      
    );
}

export default CartPage;