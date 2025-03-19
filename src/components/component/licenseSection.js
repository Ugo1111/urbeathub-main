import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../css/addToCart.css";
import HandleAddToCart from "../component/AddToCartComponent.js";
import { Link } from "react-router-dom";

export default function LicensingSection({ song, addToCart }) {
  const [toggleAccordion, setToggleAccordion] = useState("basic");
  const [accordionOpen, setAccordionOpen] = useState(true);

  // Data as an object from a database
  const licenses = {
    basic: {
      enabled: song?.monetization?.basic?.enabled || false, 
      name: "Basic License",
      price: song?.monetization?.basic?.price ? `$${song.monetization.basic.price}` : "$25.00",
      details: "MP3",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 2,500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (2 Stations)",
      ],
    },
    premium: {
      enabled: song?.monetization?.premium?.enabled || false, 
      name: "Premium License",
      price: song?.monetization?.premium?.price ? `$${song.monetization.premium.price}` : "$35.00",
      details: "MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 2,500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (2 Stations)",
      ],
    },
    wavStems: {
      enabled: song?.monetization?.wavStems?.enabled || false, 
      name: "Wav stems",
      price: song?.monetization?.wavStems?.price ? `$${song.monetization.wavStems.price}` : "$50.00",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 2,500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (23Stations)",
      ],
    },
    unlimited: {
      enabled: song?.monetization?.unlimited?.enabled || false, 
      name: "Unlimited License",
      price: song?.monetization?.unlimited?.price ? `$${song.monetization.unlimited.price}` : "$85.00",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (25 Stations)",
      ],
    },
    exclusive: {
      enabled: song?.monetization?.exclusive?.enabled || false, 
      name: "Exclusive License",
      price: "Negotiate price",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 12,500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (62 Stations)",
      ],
    },
  };

  const isExclusiveLicense = toggleAccordion === "exclusive";

  return (
    <div className="licensing-container">
      <span className="licensing-header">
        <h2>Licensing</h2>
        <div className="checkout">
          <span>
            Total: {licenses[toggleAccordion]?.price || "Select a license"}
          </span>
          {isExclusiveLicense ? (
          
              <Link to={{ pathname: "/NegotiatePage", state: { song } }}>
              <button className="negotiate-price-btn">Negotiate price</button>
            </Link>
          
          ) : (
            <>
              <HandleAddToCart song={song} selectedLicense={licenses[toggleAccordion]} />
              <Link to="/CheckoutPage" state={{ selectedSong: song }}>
                <button className="buy-now-btn">Buy now</button>
              </Link>
            </>
          )}
        </div>
      </span>

      <hr></hr>

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

      <hr></hr>
      <div className="usageTermHeader">
        <h3 className="usageTermHeaderh3">Usage Terms</h3>
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