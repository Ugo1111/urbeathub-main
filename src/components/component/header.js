import React from 'react';
import { FaCartShopping } from "react-icons/fa6";
import { AuthState } from "../AuthState";
import BeatsList from "../component/searchComponent.js";
import { db, auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";

// /Header Logo
export function Headerlogo() {
  return (
    <a href="/" className="Headerlogo">
      <img src="/beathub1.PNG" className="HeaderImage" alt="Back to Homepage"></img>
    </a>
  );
}

// /Header Logo for Producer storepage
export function ProducerHeaderlogo() {
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const targetUserId = userId || auth.currentUser?.uid;
        if (!targetUserId) return;

        const userDocRef = doc(db, "beatHubUsers", targetUserId, "store front", "details");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setBrandName(data.brandName || "My Store");
        }
      } catch (error) {
        console.error("Error fetching brand name:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandName();
  }, [userId]);

  return (
    <div className="producer-header-logo">
      {isLoading ? "" : <span className="producer-header-logo-text">{brandName || "My Store"}</span>}
    </div>
  );
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
      <FaCartShopping size="1.5em" />
    </div>
  );
}

export function GroupA2() {
  return (
    <div className="GroupA">
      <Headerlogo />
      <div className="HeaderAuthSection">
        <AuthState />
      </div>
    </div>
  );
}

export default function GroupA() {
  return (
    <div className="GroupA">
      <Headerlogo />
      <BeatsList />
      <div className="HeaderAuthSection">{/* This keeps space consistent */}
        <AuthState />
      </div>
    </div>
  );
}

export function HomeHeader() {
  return (
    <div className="GroupA">
      <Headerlogo />
      <div className="HeaderAuthSection">
        <AuthState />
      </div>
    </div>
  );
}

export function ProducerGroupA() {
  return (
    <div className="GroupA">
      <ProducerHeaderlogo />
      <div className="HeaderAuthSection">
        <AuthState />
      </div>
    </div>
  );
}
