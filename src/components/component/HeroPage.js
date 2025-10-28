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

  const scrollGenre = (direction) => {
  const container = document.getElementById("genreScroll");
  const scrollAmount = 250; // pixels to scroll per click

  if (direction === "left") {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};


  return (
    <div className="HeroPage">
  <div>
    <span className="Typed" ref={typedElement}></span>
  </div>

  <div className="HeroText">
    <h1>Top Genre</h1>

    <div className="topgenre-container">
      <button className="scroll-btn left" onClick={() => scrollGenre('left')}>
        <i className="fa fa-chevron-left"></i>
      </button>

      <div className="topgenre-buttons" id="genreScroll">
        <div className="topgenre-item">
          <button>
            <img src="./topgenre5.jpg" alt="Afro" />
            <div className="overlay">
              <i className="fa fa-drum"></i>
            </div>
          </button>
          <p>Afro</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre1.webp" alt="RnB" />
            <div className="overlay">
              <i className="fa fa-headphones"></i>
            </div>
          </button>
          <p>RnB</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre1.webp" alt="Reggaetton" />
            <div className="overlay">
              <i className="fa fa-heart"></i>
            </div>
          </button>
          <p>Reggaetton</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre1.webp" alt="Hip Hop" />
            <div className="overlay">
              <i className="fa fa-microphone"></i>
            </div>
          </button>
          <p>Hip Hop</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre1.webp" alt="Highlife" />
            <div className="overlay">
              <i className="fa fa-music"></i>
            </div>
          </button>
          <p>Highlife</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre2.jpg" alt="Trap" />
            <div className="overlay">
              <i className="fa fa-guitar"></i>
            </div>
          </button>
          <p>Trap</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre3.jpg" alt="Pop" />
            <div className="overlay">
              <i className="fa fa-star"></i>
            </div>
          </button>
          <p>Pop</p>
        </div>

        <div className="topgenre-item">
          <button>
            <img src="./topgenre4.jpg" alt="Amapiano" />
            <div className="overlay">
              <i className="fa fa-moon"></i>
            </div>
          </button>
          <p>Amapiano</p>
        </div>
      </div>

      <button className="scroll-btn right" onClick={() => scrollGenre('right')}>
        <i className="fa fa-chevron-right"></i>
      </button>
    </div>
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