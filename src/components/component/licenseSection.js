import React, { useState } from "react";
import {  FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../css/addToCart.css";



export default function LicensingSection( ) {
  const [toggleAccordion, setToggleAccordion] = useState("basic");
  const [accordionOpen, setAccordionOpen] = useState(true);
  // Data as an object from a database
  const licenses = {
    basic: {
      name: "Basic License",
      price: "$25.00",
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
      name: "Premium License",
      price: "$35.00",
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
      name: "Wav stems",
      price: "$50.00",
      details: "STEMS, MP3, WAV",
      usageTerms: [
        "Used for Music Recording",
        "Distribute up to 2,500 copies",
        "500,000 Online Audio Streams",
        "UNLIMITED Music Video",
        "For Profit Live Performances",
        "Radio Broadcasting rights (2 Stations)",
      ],
    },
    unlimited: {
      name: "Unlimited License",
      price: "$85.00",
      details: "STEMS, MP3, WAV",
    },
    exclusive: {
      name: "Exclusive License",
      price: "Negotiate price",
      details: "STEMS, MP3, WAV",
    },
  };

  return (
    <div className="licensing-container">
      <span className="licensing-header">
        <h2>Licensing</h2>
        <div className="checkout">
          <span>
            Total: {licenses[toggleAccordion]?.price || "Select a license"}
          </span>
          <button className="add-to-cart-btn">Add to Cart</button>
          <button className="buy-now-btn">Buy now</button>
        </div>
      </span>

      <hr></hr>

      <div className="licenses">
        {Object.entries(licenses).map(([key, license]) => (
          <div
            key={key}
            className={`license-card ${key === toggleAccordion ? "active" : ""}`}
            onClick={() => setToggleAccordion(key)}
          >
            <h3>{license.name}</h3>
            <p>{license.price}</p>
            <small>{license.details}</small>
          </div>
        ))}
      </div>

      <hr></hr>
      <div className="usageTermHeader">
          <h3 className="usageTermHeaderh3">Usage Terms</h3> <button onClick={() => setAccordionOpen(!accordionOpen)}>
       {accordionOpen ? <FaChevronUp size="1.5em"/> :  <FaChevronDown size="1.5em"/>}
    </button>
        </div>

        <div
      className={accordionOpen ? "accordionOpen" : "panel"}
    >
     

        <br></br>
        <span>{licenses[toggleAccordion]?.name}</span>
        <span> ({licenses[toggleAccordion]?.price})</span>
        <br></br>
        <br></br>
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
