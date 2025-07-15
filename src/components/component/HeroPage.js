import React, { useRef, useEffect, useState } from "react"; // Import useRef, useEffect, and useState
import "../css/component.css"; // Ensure the path is correct for styles
import Typed from "typed.js"; // Import Typed.js for the typing effect
import { db, auth } from "../../firebase/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom"; // Import useParams for dynamic userId

function HeroPage() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [
        "Ur BeatHub is a Global Platform for Music Creators",
        "Your Next Hit Start Here",
        "Your Sound Your Way: Quality Beats For Everyone!",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    });

    return () => {
      typed.destroy(); // Cleanup Typed.js instance on component unmount
    };
  }, []);

  return (
    <div className="HeroPage">
      <div>
        <span className="Typed" ref={typedElement}></span>
      </div>
      <div className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Instrumental.</h1>
        <h5>
          Get high quality instrumental beats made for artists and creators. Explore Amapiano, Afrobeat, Pop, Reggaeton etc from top producers. Your next hit starts here.
        </h5>
      </div>
    </div>
  );
}

function ProducersHeroPage() {
  const [storeTitle1, setStoreTitle1] = useState("");
  const [storeTitle2, setStoreTitle2] = useState("");
  const { userId } = useParams(); // Get userId from URL parameters

  useEffect(() => {
    const fetchStoreTitles = async () => {
      try {
        const targetUserId = userId || auth.currentUser?.uid; // Use userId from URL or logged-in user
        if (!targetUserId) return;

        const userDocRef = doc(db, "beatHubUsers", targetUserId, "store front", "details");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setStoreTitle1(data.storeTitle1 || "");
          setStoreTitle2(data.storeTitle2 || "");
        }
      } catch (error) {
        console.error("Error fetching store titles:", error);
      }
    };

    fetchStoreTitles();
  }, [userId]);

  return (
    <div className="HeroPageProducer">
      <div className="HeroTextProducer">
        <h5>{storeTitle1}</h5> {/* Dynamic store title 1 */}
        <h1>{storeTitle2 || "Shaping the sound of modern music."}</h1> {/* Dynamic store title 2 with fallback */}
      </div>
    </div>
  );
}

// Ensure named exports for both components
export { HeroPage, ProducersHeroPage };