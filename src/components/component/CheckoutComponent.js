import React, { useState } from "react";
import "../css/checkout.css";

import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, updateDoc,doc,checkRef,getDoc,getDocs, Timestamp } from "firebase/firestore";

function CheckoutComponent({ selectedSong }) {

    

    const docRef = doc(db, "beats", "selectedSong.id"  )
const checkRef = collection(docRef, "monetization" )
    const ugo = getDocs(checkRef)

    return (
        <div className="cart-Component-wrapper">
            {selectedSong ? (
                <h2>Selected Song: {checkRef.id} {ugo.id}</h2> 
            ) : (
                <p>No song selected for checkout.</p>  
            )}
        </div>
    );
}

export default CheckoutComponent;