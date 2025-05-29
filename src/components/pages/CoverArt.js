import React, { useState, useRef } from 'react';
import "../css/component.css";
import { Link } from "react-router-dom";
import GroupA from "../component/header.js";
import { GroupF, GroupG } from "../component/footer";
import { Helmet } from 'react-helmet';

const coverart = "/images/art.jpg";
const coverart2 = "/images/art1.jpg";
const coverart3 = "/images/art2.jpg";
const coverart4 = "/images/art3.jpg";
const coverart5 = "/images/art4.jpg";
const coverart6 = "/images/arts.jpg";
const coverart7 = "/images/hologram.jpg";
const coverart9 = "/images/Artist.jpg";
const coverart10 = "/images/strings.jpg";
const coverart11 = "/images/moon.jpg";
const coverart12 = "/images/inside.jpg";
const coverart13 = "/images/guitar-cover.jpg"; 
const coverart14 = "/images/Green.jpg";// Example for additional cover art

function CoverArt() {
  const [albumName, setAlbumName] = useState("PRODUCER NAME");
  const [beatTitle, setBeatTitle] = useState("BEAT TITLE");
  const [filter, setFilter] = useState("none");
  const [color, setColor] = useState("white");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [selectedArt, setSelectedArt] = useState(coverart9);
  const [lastDefaultArt, setLastDefaultArt] = useState(coverart);
  const [showEnhancer, setShowEnhancer] = useState(false);

  const canvasRef = useRef(null);

  const albumTextPositions = {
    [coverart]: { top: "5%", left: "30%", rotation: 0 },
    [coverart2]: { top: "30%", left: "10%", rotation: 0 },
    [coverart3]: { bottom: "10%", left: "30%", rotation: 0 },
    [coverart4]: { top: "60%", right: "52%", rotation: 90 },
    [coverart5]: { top: "30%", left: "25%", rotation: 0 },
    [coverart6]: { top: "30%", left: "10%", rotation: 0 },
    [coverart7]: { top: "5%", left: "30%", rotation: 0 },
    [coverart9]: { top: "5%", left: "10%", rotation: 0 },
    [coverart10]: { top: "5%", left: "30%", rotation: 0 },
    [coverart11]: { top: "5%", left: "30%", rotation: 0 },
    [coverart12]: { top: "5%", left: "30%", rotation: 0 },
    [coverart13]: { top: "5%", left: "30%", rotation: 0 }, 
    [coverart14]: { bottom: "20%", left: "25%", rotation: 0 }, // Example for additional cover art
  };

  const beatTextPositions = {
    [coverart]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart2]: { top: "60%", left: "10%", rotation: 0 },
    [coverart3]: { top: "50%", left: "30%", rotation: 0 },
    [coverart4]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart5]: { top: "60%", left: "30%", rotation: 0},
    [coverart6]: { top: "60%", left: "10%", rotation: 0 },
    [coverart7]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart9]: { bottom: "25%", left: "55%", rotation: 90 },
    [coverart10]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart11]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart12]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart13]: { bottom: "5%", left: "30%", rotation: 0 },
    [coverart14]: { bottom: "5%", left: "30%", rotation: 0 }, // Example for additional cover art
  };

  const [albumPosition, setAlbumPosition] = useState(albumTextPositions[coverart]);
  const [beatPosition, setBeatPosition] = useState(beatTextPositions[coverart]);

  const handleKey = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = selectedArt;

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = filter;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Album Name
      const albumPos = getCoordinatesFromPosition(albumPosition, canvas);
      ctx.save();
      ctx.translate(albumPos.x, albumPos.y);
      ctx.rotate((albumPosition.rotation || 0) * Math.PI / 180);
      ctx.font = `bold 24px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.fillText(albumName, 0, 0);
      ctx.restore();

      // Beat Title
      const beatPos = getCoordinatesFromPosition(beatPosition, canvas);
      ctx.save();
      ctx.translate(beatPos.x, beatPos.y);
      ctx.rotate((beatPosition.rotation || 0) * Math.PI / 180);
      ctx.font = `bold 18px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.fillText(beatTitle, 0, 0);
      ctx.restore();

      const link = document.createElement("a");
      link.download = "cover-art.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const getCoordinatesFromPosition = (pos, canvas) => {
    let x = 0, y = 0;
    if (pos.left !== undefined) {
      x = (parseFloat(pos.left) / 100) * canvas.width;
    } else if (pos.right !== undefined) {
      x = canvas.width - (parseFloat(pos.right) / 100) * canvas.width;
    }
    if (pos.top !== undefined) {
      y = (parseFloat(pos.top) / 100) * canvas.height;
    } else if (pos.bottom !== undefined) {
      y = canvas.height - (parseFloat(pos.bottom) / 100) * canvas.height;
    }
    return { x, y };
  };

  return (
    <>
    <Helmet>
     <title>Create Custom Beat Cover Art Online | UrBeatHub Cover Art Editor</title>
     </Helmet>
      <GroupA />
      <div className="coverart-container">
         <div className="image-and-picker-wrapper">
        <div className="coverart-image-container" style={{ backgroundImage: `url(${selectedArt})`, filter }}>
            <input
            className="editable-text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            onKeyDown={handleKey}
            style={{
              position: "absolute",
              ...albumPosition,
              fontSize,
              fontWeight: "bold",
              background: "transparent",
              border: "none",
              outline: "none",
              color,
              fontFamily,
              maxWidth: "90%",
            wordBreak: "break-word",
             whiteSpace: "pre-line",
              transform: `rotate(${albumPosition.rotation || 0}deg)`
            }}
          />
          <input
            className="editable-text"
            value={beatTitle}
            onChange={(e) => setBeatTitle(e.target.value)}
            onKeyDown={handleKey}
            style={{
              position: "absolute",
              ...beatPosition,
              fontSize,
              fontWeight: "bold",
              background: "transparent",
              border: "none",
              outline: "none",
              color,
              fontFamily,
              maxWidth: "90%",
             wordBreak: "break-word",
             whiteSpace: "pre-line",
              transform: `rotate(${beatPosition.rotation || 0}deg)`
            }}
          />
          
        </div>
        <div className="design-picker-container">
          <div className="design-picker">
            {[coverart9, coverart7, coverart14, coverart, coverart2, coverart3, coverart10, coverart11, coverart12, coverart4, coverart5, coverart6, coverart13].map((img, index) => (
              <button
                key={index}
                className="design-button"
                onClick={() => {
                  setSelectedArt(img);
                  setLastDefaultArt(img);
                  setAlbumPosition(albumTextPositions[img]);
                  setBeatPosition(beatTextPositions[img]);
                }}
              >
                <img src={img} alt={`Design ${index + 1}`} className="design-preview" />
              </button>
            ))}
          </div>
          </div>
           </div>
        

        <div className="coverart-row2">
          <p>Create your Cover Art with Layouts, Images, Presets, Filters, Fonts, and Overlays</p>


          <button onClick={downloadImage} className="download-button">Download Cover Art</button>
          <button style={{ marginTop: "10px", backgroundColor: "#db3056", color: "#ffffff", padding: "10px" }}
            onClick={() => setShowEnhancer(true)}>Enhance image</button>

          {showEnhancer && (
            <>
              <div className="upload-section">
                <label>Or Upload Your Own:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setSelectedArt(reader.result);
                        // Do NOT change text positions when uploading
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

               {/* Filter & Font Settings */}
              <div className="editor-controls">
                <div className="control">
                  <label>Filter</label>
                  <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    <option value="none">No Filter</option>
                    <option value="grayscale(100%)">Grayscale</option>
                    <option value="sepia(100%)">Sepia</option>
                    <option value="invert(100%)">Invert</option>
                    <option value="hue-rotate(90deg)">Hue Rotate</option>
                    <option value="opacity(50%)">Opacity</option>
                    <option value="blur(2px)">Blur</option>
                    <option value="brightness(0.5)">Dark</option>
                    <option value="saturate(50%)">Low Saturation</option>
                    <option value="contrast(150%)">High Contrast</option>
                    <option value="contrast(50%)">Low Contrast</option>
                    <option value="brightness(1.2)">Brighter</option>
                  </select>
                </div>

                <div className="control">
                  <label>Font Color</label>
                  <select onChange={(e) => setColor(e.target.value)} value={color}>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="pink">Pink</option>
                    <option value="gray">Gray</option>
                    <option value="brown">Brown</option>
                  </select>
                </div>

                <div className="control">
                  <label>Font Size</label>
                  <select onChange={(e) => setFontSize(e.target.value)} value={fontSize}>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                     </select>
                </div>

                <div className="control">
                  <label>Font Family</label>
                  <select onChange={(e) => setFontFamily(e.target.value)} value={fontFamily}>
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                     <option value="Impact">Impact</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Lucida Console">Lucida Console</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>

            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} width="500" height="500" style={{ display: "none" }} />
      <GroupF />
      <GroupG />
    </>
  );
}

export default CoverArt;
