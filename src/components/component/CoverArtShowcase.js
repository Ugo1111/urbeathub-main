import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/CoverArtShowcase.css";

const CoverArtShowcase = ({ isSignedIn }) => {
  const navigate = useNavigate();

  const coverImages = [
    "/images/Artist.jpg",
    "/images/hologram.jpg",
    "/images/Green.jpg",
    "/images/art.jpg",
    "/images/art1.jpg",
    "/images/art2.jpg",
    "/images/strings.jpg",
    "/images/moon.jpg",
    "/images/inside.jpg",
    "/images/art3.jpg",
    "/images/art4.jpg",
    "/images/arts.jpg",
    "/images/guitar-cover.jpg",
  ];

  const [selectedCover, setSelectedCover] = useState(coverImages[0]);
  const [imageIndex, setImageIndex] = useState(0);
  const [albumName, setAlbumName] = useState("Album Title");
  const [beatTitle, setBeatTitle] = useState("Beat Title");

  const [albumTextPos, setAlbumTextPos] = useState({
    top: "20%",
    left: "10%",
    rotation: 0,
  });

  const [beatTextPos, setBeatTextPos] = useState({
    bottom: "20%",
    left: "10%",
    rotation: 0,
  });

  const fontSize = "24px";
  const fontWeight = "bold";
  const fontFamily = "Arial";
  const color = "#ffffff";
  const filter = "none";

  const handleKey = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => {
        const nextIndex = (prev + 1) % coverImages.length;
        setSelectedCover(coverImages[nextIndex]);
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [coverImages]);

  return (
    <div className="showcase-wrapper">
      <div className="showcase-info">
        <h2>
          Be Your Own <span className="Graphics-art">Graphic Designer</span>
        </h2>
        <p>
          Create your Cover Art with Layouts, Images, Presets, Filters, Fonts, and Overlays.
        </p>
        <button
          className="showcase-button"
          onClick={() =>
            isSignedIn ? navigate("/imageEditor") : navigate("/signUpPage")
          }
        >
          {isSignedIn ? "Go to Cover Art Editor →" : "Sign up →"}
        </button>
      </div>

      <div className="showcase-display">
        <div
          className="coverart-main"
          style={{ backgroundImage: `url(${selectedCover})`, filter }}
        >
          <input
            className="coverart-input"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            onKeyDown={handleKey}
            style={{
              position: "absolute",
              ...albumTextPos,
              fontSize,
              fontWeight,
              background: "transparent",
              border: "none",
              outline: "none",
              color,
              fontFamily,
              maxWidth: "90%",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              transform: `rotate(${albumTextPos.rotation || 0}deg)`,
            }}
          />
          <input
            className="coverart-input"
            value={beatTitle}
            onChange={(e) => setBeatTitle(e.target.value)}
            onKeyDown={handleKey}
            style={{
              position: "absolute",
              ...beatTextPos,
              fontSize,
              fontWeight,
              background: "transparent",
              border: "none",
              outline: "none",
              color,
              fontFamily,
              maxWidth: "90%",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              transform: `rotate(${beatTextPos.rotation || 0}deg)`,
            }}
          />
        </div>

        <div className="design-picker-container">
          <div className="design-picker">
            {coverImages.map((img, index) => (
              <button
                key={index}
                className="design-button"
                onClick={() => {
                  setSelectedCover(img);
                  setImageIndex(index);
                }}
              >
                <img src={img} alt={`Design ${index + 1}`} className="design-preview" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverArtShowcase;
