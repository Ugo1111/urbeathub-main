import React from 'react';
import { FaCartShopping } from "react-icons/fa6";
import { AuthState } from "../AuthState";
import BeatsList from "../component/searchComponent.js";
import { db, auth } from "../../firebase/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom"; // Import useParams for dynamic userId

// /Header Logo
export function Headerlogo() {
  return (
    <a href="/" className="Headerlogo">
      <img src="./beathub1.PNG" className="HeaderImage"></img>
    </a>
  );
}

// /Header Logo for Producer storepage
export function ProducerHeaderlogo() {
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { userId } = useParams(); // Get userId from URL parameters

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const targetUserId = userId || auth.currentUser?.uid; // Use userId from URL or logged-in user
        if (!targetUserId) return;

        const userDocRef = doc(db, "beatHubUsers", targetUserId, "store front", "details");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setBrandName(data.brandName || "My Store"); // Fallback to "My Store"
        }
      } catch (error) {
        console.error("Error fetching brand name:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchBrandName();
  }, [userId]);

 return (
  <div className="producer-header-logo">
    {isLoading ? "" : <span className="producer-header-logo-text">{brandName || "My Store"}</span>}
  </div>
);
 // Dynamic brand name with fallback
}

//Header search bar
export function HeaderSearchBar() {
  function setSearchTerm() {}
  return (
    <input
      type="text"
      className="HeaderSearchBar"
      value=" 🔎 search for your song"
      onChange={(e) => setSearchTerm(e.target.value)}
    ></input>
  );
}

//Header cart Icon
export function HeaderCartIcon() {
  return (
    <div className="HeaderCartIcon">
      <FaCartShopping color="" size="1.5em" />
    </div>
  );
}

export function GroupA2() {
  return (
    <div className="GroupA2">
      <Headerlogo /> <AuthState />
      {" "}
    </div>
  );
}

export default function GroupA() {
  return (
    <div className="GroupA">
      <Headerlogo /> <BeatsList /> <AuthState />
      {" "}
    </div>
  );
}

// HomeHeader mirrors the GroupA layout but omits the search bar for clarity.
export function HomeHeader() {
  return (
    <div className="GroupA">
      <Headerlogo />
      <AuthState />
    </div>
  );
}

export function ProducerGroupA() {
  return (
    <div className="GroupA1">
      <ProducerHeaderlogo /> <AuthState />
    </div>
  );
}

