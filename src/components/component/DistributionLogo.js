import React from "react";
import "../css/MusicDistributionForm.css"; // Import the CSS animation styles
import {
  FaSpotify,
  FaApple,
  FaAmazon,
  FaYoutube,
  FaDeezer,
  FaSoundcloud,
  FaCompactDisc,
  FaMusic,
  FaGooglePlay,
  FaInstagram ,
  FaGlobe,
  
} from "react-icons/fa";

const DistributionLogo = () => {
  const logos = [
    { name: "Spotify", icon: <FaSpotify color="gray" size={24} /> },
    { name: "Apple Music", icon: <FaApple color="gray" size={24} /> },
    { name: "Amazon Music", icon: <FaAmazon color="gray" size={24} /> },
    { name: "YouTube", icon: <FaYoutube color="gray" size={24} /> },
    { name: "Deezer", icon: <FaDeezer color="gray" size={24} /> },
    { name: "SoundCloud", icon: <FaSoundcloud color="gray" size={24} /> },
     {name: "instagram", icon: <FaInstagram color="gray" size={24} />},
     {name: "Tidal", icon: <FaCompactDisc  color="gray" size={24} /> }, 
     {name: "TikTok", icon: <FaGlobe  color="gray" size={24} /> }, 

    
   
  ];

  const allLogos = [...logos, ...logos]; // for looping animation

  return (
    <div className="slider-container">
      <div className="slider-description">
        <h3>Distribute your music to all major platforms and reach a global audience.</h3>
      </div>
      <div className="slider-track">
        {allLogos.map((logo, index) => (
          <div className="logo-box" key={index} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {logo.icon}
            <span style={{ color: "whitesmoke" }}>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
    
  );
};

export default DistributionLogo;
