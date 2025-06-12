import React from "react";
import "../css/MusicDistributionForm.css"; // Import the CSS animation styles

const DistributionLogo = () => {
  const logos = [
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "/images/Tidal.png",
      "/images/deezer.png",
    "https://upload.wikimedia.org/wikipedia/commons/4/4f/Amazon_Music_logo.svg",
    "/images/amazon.png",
    "https://upload.wikimedia.org/wikipedia/commons/6/6e/Tidal_logo.svg",
  ];

  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos];

  return (
    <div className="slider-container">
      <div className="slider-track">
        {allLogos.map((logo, index) => (
          <div className="logo-box" key={index}>
            <img src={logo} alt="Music Logo" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionLogo;
