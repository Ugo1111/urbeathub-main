import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaDownload } from "react-icons/fa";
import "../css/addToCart.css";
import HandleAddToCart from "../component/AddToCartComponent.js";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function LicensingSection({ song, addToCart }) {
  const [toggleAccordion, setToggleAccordion] = useState("basic");
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [purchasedLicenses, setPurchasedLicenses] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  // Data as an object from a database (same as your original code)
  const licenses = {
    basic: {
      enabled: song?.monetization?.basic?.enabled || false,
      name: "Basic License",
      price: song?.monetization?.basic?.price ? `$${song.monetization.basic.price}` : "$25.00",
      details: "MP3",
      usageTerms: [
        "Receive a High Quality MP3",
       "Use It Commercially",
       "Sell Up To 5,000 Copies",
       "Available For 10,000 Streams",
       "No YouTube Monetization",
       "Must Credit Ur BeatHub",
      ],
    },
    premium: {
      enabled: song?.monetization?.premium?.enabled || false,
      name: "Premium License",
      price: song?.monetization?.premium?.price ? `$${song.monetization.premium.price}` : "$35.00",
      details: "MP3, WAV",
      usageTerms: [
        "Receive HQ MP3 & WAV",
        "Use It Commercially",
        "Sell Up To 10,000 Copies",
        "Available For 50,000 Streams",
         "YouTube Monetization",
         "Must Credit Ur BeatHub",
      ],
    },
    wavStems: {
      enabled: song?.monetization?.wavStems?.enabled || false,
      name: "Wav stems",
      price: song?.monetization?.wavStems?.price ? `$${song.monetization.wavStems.price}` : "$50.00",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Receive HQ MP3, WAV & Trackouts",
         "Use It Commercially",
         "Sell Up To 20,000 Copies",
          "Limited to 100,000 Streams",
          "YT Monetization + 1 Music Video",
           "Must Credit Ur BeatHub",
      ],
    },
    unlimited: {
      enabled: song?.monetization?.unlimited?.enabled || false,
      name: "Unlimited License",
      price: song?.monetization?.unlimited?.price ? `$${song.monetization.unlimited.price}` : "$85.00",
      details: "STEMS, MP3, WAV",
      usageTerms: [
         "Receive HQ MP3, WAV & Trackouts",
         "Use It Commercially",
         "Sell Up To 20,000 Copies",
          "Limited to 100,000 Streams",
          "YT Monetization + 1 Music Video",
           "Must Credit Ur BeatHub",

      ],
    },
    exclusive: {
      enabled: song?.monetization?.exclusive?.enabled || false,
      name: "Exclusive License",
      price: "Negotiate price",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Use It Commercially",
        "Unlimited Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (62 Stations)",
      ],
    },
  };

  const isExclusiveLicense = toggleAccordion === "exclusive";

  useEffect(() => {
    const fetchPurchasedLicenses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const purchasedLicenses = [];
        const purchasesRef = collection(db, `beatHubUsers/${user.uid}/purchases`);
        const purchasesSnapshot = await getDocs(purchasesRef);

        // Loop through each purchase and store license info
        purchasesSnapshot.forEach((purchaseDoc) => {
          const purchaseData = purchaseDoc.data();
          const { beatId, license } = purchaseData;

          if (beatId === song.id) {
            purchasedLicenses.push(license);
          }
        });

        setPurchasedLicenses(purchasedLicenses);
      } catch (error) {
        console.error("Error fetching purchased licenses:", error);
      }
    };

    fetchPurchasedLicenses();
  }, [auth.currentUser, song.id]);

  const isLicensePurchased = purchasedLicenses.includes(licenses[toggleAccordion]?.name);

  return (
    <div className="licensing-container">
      <span className="licensing-header">
        <h2>Licensing</h2>
        <div className="checkout">
          <span>
            Total: {licenses[toggleAccordion]?.price || "Select a license"}
          </span>
          {isExclusiveLicense ? (
            <Link to={{ pathname: "/NegotiatePage", state: { song, licenses, toggleAccordion } }}>
              <button className="negotiate-price-btn">Negotiate price</button>
            </Link>
          ) : isLicensePurchased ? (
            // Display the Download button if the license has been purchased
            <a href={song.musicUrls?.mp3 || "#"} download>
              <button className="buy-now-btn">
                <FaDownload /> Download
              </button>
            </a>
          ) : (
            <>
              <HandleAddToCart song={song} selectedLicense={licenses[toggleAccordion]} />
              <Link
                to="/CheckoutPage"
                state={{
                  item: "Chosen Item",
                  selectedSong: song,
                  selectedLicense: licenses[toggleAccordion],
                  licenses,
                  toggleAccordion,
                }}
              >
                <button className="buy-now-btn">Buy now</button>
              </Link>
            </>
          )}
        </div>
      </span>

      <hr />

      <div className="licenses">
        {Object.entries(licenses)
          .filter(([_, license]) => license.enabled) // Show only enabled licenses
          .map(([key, license]) => (
            <div key={key} className={`license-card ${key === toggleAccordion ? "active" : ""}`} onClick={() => setToggleAccordion(key)}>
              <h3>{license.name}</h3>
              <p>{license.price}</p>
              <small>{license.details}</small>
            </div>
          ))}
      </div>

      <hr />
      <div className="usageTermHeader">
        <h3 className="usageTermHeaderh3">The terms</h3>
        <button onClick={() => setAccordionOpen(!accordionOpen)}>
          {accordionOpen ? <FaChevronUp size="1.5em" /> : <FaChevronDown size="1.5em" />}
        </button>
      </div>

      <div className={accordionOpen ? "accordionOpen" : "panel"}>
        <br />
        <span>{licenses[toggleAccordion]?.name}</span>
        <span> ({licenses[toggleAccordion]?.price})</span>
        <br />
        <br />
        <div className="usageTermSection">
          {licenses[toggleAccordion]?.usageTerms?.map((term, index) => (
            <div key={index} className="usageTermList">
              {term}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}