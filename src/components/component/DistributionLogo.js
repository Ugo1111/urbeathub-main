import React from "react";
import "../css/MusicDistributionForm.css";
import {
  FaSpotify,
  FaApple,
  FaAmazon,
  FaYoutube,
  FaDeezer,
  FaSoundcloud,
  FaCompactDisc,
  FaGlobe,
  FaInstagram,
} from "react-icons/fa";

const DistributionLogo = () => {
  const logos = [
    { name: "Spotify", icon: <FaSpotify color="whitesmoke" size={48} /> },
    { name: "Apple Music", icon: <FaApple color="whitesmoke" size={48} /> },
    { name: "Amazon Music", icon: <FaAmazon color="whitesmoke" size={48} /> },
    { name: "YouTube", icon: <FaYoutube color="whitesmoke" size={48} /> },
    { name: "Deezer", icon: <FaDeezer color="whitesmoke" size={48} /> },
    { name: "SoundCloud", icon: <FaSoundcloud color="whitesmoke" size={48} /> },
    { name: "Instagram", icon: <FaInstagram color="whitesmoke" size={48} /> },
    { name: "Tidal", icon: <FaCompactDisc color="whitesmoke" size={48} /> },
    { name: "TikTok", icon: <FaGlobe color="whitesmoke" size={48} /> },
  ];

  const allLogos = [...logos, ...logos]; // for animation loop

  return (
    <div className="slider-container">
      <div className="slider-description">
        <h3>Distribute your music to all major platforms and reach a global audience.</h3>
      </div>
      <div className="slider-track">
        {allLogos.map((logo, index) => (
          <div className="logo-box" key={index} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {logo.icon}
            <span style={{ color: "whitesmoke", fontSize: "1.1rem" }}>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionLogo;
