import React, { useState } from "react";
import "../css/MusicDistributionForm.css";
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
  FaGlobe,
} from "react-icons/fa";
import GroupA from "../component/header.js";
import { GroupF, GroupG } from "../component/footer";


const stores = [
  { name: "Spotify", icon: <FaSpotify />, color: "#1DB954" },
  { name: "Apple Music", icon: <FaApple />, color: "#FA57C1" },
  { name: "Amazon", icon: <FaAmazon />, color: "#FF9900" },
  { name: "Amazon Mp3", icon: <FaAmazon />, color: "#FF9900" }, // same as Amazon
  { name: "YouTube Music", icon: <FaYoutube />, color: "#FF0000" },
  { name: "Deezer", icon: <FaDeezer />, color: "#EF5466" },
  { name: "SoundCloud", icon: <FaSoundcloud />, color: "#FF5500" },
  { name: "eMUSIC", icon: <FaMusic />, color: "#1E90FF" }, // blue
  { name: "Tidal", icon: <FaCompactDisc />, color: "#000000" }, // black
  { name: "Claro-musica", icon: <FaGooglePlay />, color: "#00BCD4" },
  { name: "RN Direct", icon: <FaGlobe />, color: "#4CAF50" }, // green
  { name: "Nuuday", icon: <FaGlobe />, color: "#673AB7" }, // purple
  { name: "iTunes", icon: <FaApple />, color: "#FA57C1" }, // same as Apple Music
  { name: "Napster", icon: <FaGlobe />, color: "#00ADEF" }, // light blue
  { name: "Gracenote", icon: <FaGlobe />, color: "#FF3366" }, // pinkish red
  { name: "Anghami", icon: <FaGlobe />, color: "#FF5C3C" }, // orange red
  { name: "Kanjian", icon: <FaGlobe />, color: "#009688" }, // teal
  { name: "Pandora", icon: <FaGlobe />, color: "#0056D2" }, // blue
  { name: "Melon", icon: <FaGlobe />, color: "#57C900" }, // green
  { name: "iHeartRadio", icon: <FaGlobe />, color: "#E61817" }, // red
  { name: "7Digital", icon: <FaGlobe />, color: "#FF4E00" }, // orange
  { name: "Saavn", icon: <FaGlobe />, color: "#1D4B91" }, // dark blue
  { name: "Bugs", icon: <FaGlobe />, color: "#FF7900" }, // orange
  { name: "AWA", icon: <FaGlobe />, color: "#FF0000" }, // red
  { name: "Vibe", icon: <FaGlobe />, color: "#0099FF" }, // blue
  { name: "Tencent", icon: <FaGlobe />, color: "#20A0FF" }, // blue
  { name: "Qobuz", icon: <FaGlobe />, color: "#00A2E8" }, // cyan
  { name: "Facebook", icon: <FaGlobe />, color: "#1877F2" }, // blue
  { name: "Netease", icon: <FaGlobe />, color: "#F1302B" }, // red
  { name: "Tiktok", icon: <FaGlobe />, color: "#010101" }, // black
  { name: "Kuack Media", icon: <FaGlobe />, color: "#FF4E00" }, // orange (approx)
  { name: "FLO", icon: <FaGlobe />, color: "#D6123E" }, // pink/red
  { name: "KKBOX", icon: <FaGlobe />, color: "#0B75FF" }, // blue
  { name: "Zing MP3", icon: <FaGlobe />, color: "#FF5C00" }, // orange
  { name: "Joox", icon: <FaGlobe />, color: "#3B82F6" }, // blue
  { name: "Boomplay", icon: <FaGlobe />, color: "#FF6600" }, // orange
  { name: "Genie Music", icon: <FaGlobe />, color: "#4C8FFF" }, // blue
  { name: "Line Music", icon: <FaGlobe />, color: "#00C300" }, // green
  { name: "Capcut", icon: <FaGlobe />, color: "#000000" }, // black
  { name: "AllSaint", icon: <FaGlobe />, color: "#9E9E9E" }, // grey
  { name: "Select All", icon: <FaGlobe />, color: "#9E9E9E" }, // grey
];



// Combine all store names for tags
const allStoreTags = [
  ...stores.map((store) => store.name),
  
];

// Remove duplicates in case of overlap
const uniqueStoreTags = [...new Set(allStoreTags)];

const MusicDistributionForm = () => {
  const [activeSection, setActiveSection] = useState("album");
  const [territoryInput, setTerritoryInput] = useState("");
const [territoryTags, setTerritoryTags] = useState([]);

const handleTerritoryKeyDown = (e) => {
  if (e.key === "Enter" && territoryInput.trim()) {
    e.preventDefault();
    if (!territoryTags.includes(territoryInput.trim())) {
      setTerritoryTags([...territoryTags, territoryInput.trim()]);
    }
    setTerritoryInput("");
  }
};

const removeTerritoryTag = (tagToRemove) => {
  setTerritoryTags(territoryTags.filter(tag => tag !== tagToRemove));
};


  const renderSection = () => {
    switch (activeSection) {
      case "album":
        return (
          <div className="Album-container">
            {/* Album form... (same as your original, no changes) */}
            <h2>Release Data</h2>
            <form>
              <label>UPC / EAN:</label>
              <input type="text" required />
              <i>	
If you don't have a UPC / EAN please leave blank and we can generate one for you.
</i>
              <label>Release Title*:</label>
              <input type="text" required />
              <i>This will be the title of your release.</i>
<h2>Album Details</h2>
              <label>Language</label>
              <select>
                <option>English</option>
              </select>
              <label>Album/Single/EP Title *</label>
              <input type="text" required />
              <label>Album Version</label>
              <input type="text" required />
              <label>Does this release contain cover versions?</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" /> Yes
                </label>
                <label>
                  <input type="checkbox" /> No
                </label>
              </div>
              <label>Compilation Album</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" /> Yes
                </label>
                <label>
                  <input type="checkbox" /> No
                </label>
              </div>
              <label>Artist Name *</label>
              <input type="text" />
              <button type="button">Add Artist</button>
              <div className="section">
                <label>Writers *</label>
                <input type="text" placeholder="Composer" required />
                <button type="button">Add Composer</button>
              </div>
              <label>Does this release contain lyrics?</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" /> Yes
                </label>
                <label>
                  <input type="checkbox" /> No
                </label>
              </div>
              <label>Primary Genre</label>
              <select>
                <option>Blues</option>
              </select>
              <label>Secondary Genre</label>
              <select>
                <option>Alternative</option>
              </select>
              <label>Composition Copyright *</label>
              <input type="text" />
              <label>Sound Recording Copyright *</label>
              <input type="text" />
              <label>Record Label Name *</label>
              <input type="text" />
              <label>Originally Released *</label>
              <input type="date" />
              <label>Pre Order Date</label>
              <input type="date" />
              <label>Sales Start Date</label>
              <input type="date" />
              <button type="button">Add Time</button>
              <label>Explicit Content *</label>
              <select>
                <option>Not Explicit</option>
              </select>
              <div className="btn-group">
                <button type="button" className="back-btn">
                  Back
                </button>
                <button type="submit" className="save-btn">
                  Save and Continue
                </button>
              </div>
            </form>
          </div>
        );

      case "music":
        return (
          <div>
            <h1 className="section-title">Upload your audio files</h1>
            <h2>We accept</h2>
            <ul className="file-types">
              <li><i>High quality MP3 320kbps - 44.1 KH</i></li>
              <li><i>High quality FLAC - 44.1 KHz</i></li>
              </ul>
              <label>Track Title</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <input type="text" placeholder="Track Title" className="input" />
  <button>+ Add Track</button>
</div>

            <input type="file" accept="audio/*" className="input" />
          </div>
        );

      case "cover":
        return (
          <div>
            <h2 className="section-title">Upload Album Artwork</h2>
            <input type="file" accept="image/*" className="input" />
            <h3>Artwork Requirements</h3>
            <ul className="requirements">
              <li><i>Minimum size: 3000 x 3000 pixels</i></li>
              <li><i>Maximum size: 20 MB</i></li>
              <li><i>Format: JPEG or PNG</i></li>
              </ul>
              <h3>Need help with your Artwork <a href="/coverArt">click here</a></h3>
          </div>
        );

      case "store":
        return (
          <>

          <h2>Choose your stores</h2>
            <div className="store-grid-section">
              {stores.map((store, index) => (
                <label key={index} className="store-label">
                  <input
                    type="checkbox"
                    defaultChecked={store.name !== "Select All"}
                  />
                  <div
                    className="store-icon"
                    style={{
                      color: store.color,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {store.icon}
                    <span className="store-name">{store.name}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="store-info-box">
              <strong>Important Information</strong>
              <br />
              By selecting YouTube you agree to the following:
              <ul>
                <li>
                  Your audio is valid for Content ID and contains no samples,
                  creative commons or public domain audio, is not a karaoke or
                  sound-a-like, is not meditation music.
                </li>
                <li>
                  Your audio has not been distributed to YouTube by any other
                  party.
                </li>
              </ul>
            </div>

            <div className="store-pricing-section">
              <h3>iTunes & Apple Music Pricing</h3>
              <label>
                <input type="checkbox" defaultChecked /> Standard
              </label>
              <label>
                <input type="checkbox" /> Lowest
              </label>
              <label>
                <input type="checkbox" /> Low
              </label>
              <label>
                <input type="checkbox" /> High
              </label>

              <h3>Amazon Pricing</h3>
              <label>
                <input type="checkbox" defaultChecked /> Standard
              </label>
              <label>
                <input type="checkbox" /> Lowest
              </label>
              <label>
                <input type="checkbox" /> Low
              </label>
              <label>
                <input type="checkbox" /> High
              </label>

              <h3>Tencent Pricing</h3>
              <label>
                <input type="checkbox" defaultChecked /> Standard
              </label>
              <label>
                <input type="checkbox" /> Lowest
              </label>
              <label>
                <input type="checkbox" /> Low
              </label>
              <label>
                <input type="checkbox" /> High
              </label>

              <h3>Qobuz Pricing</h3>
              <label>
                <input type="checkbox" defaultChecked /> Standard
              </label>
              <label>
                <input type="checkbox" /> Lowest
              </label>
              <label>
                <input type="checkbox" /> Low
              </label>
              <label>
                <input type="checkbox" /> High
              </label>
            </div>

            <div className="store-territory-section">
              <h2>Managing Territories</h2>
              <div className="store-warning-box">
                <strong>Warning! How to Distribute Worldwide.</strong>
                <br />
                For worldwide distribution please do not add territory
                information. Selected stores with no additional territory
                information will be distributed worldwide.
              </div>

              <form>
                <div className="form-group">
                  <label>I would like to:</label>
                  <div className="button-group">
                    <button type="button" className="active">
                      Include
                    </button>
                    <button type="button">Exclude</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>these territories:</label>
                  <div className="territory-input-wrapper">
  <input
    type="text"
    placeholder="Type and press Enter"
    value={territoryInput}
    onChange={(e) => setTerritoryInput(e.target.value)}
    onKeyDown={handleTerritoryKeyDown}
  />
  <div className="tags-box">
    {territoryTags.map((tag, idx) => (
      <span key={idx} className="tag">
        {tag}
        <span
          className="remove"
          onClick={() => removeTerritoryTag(tag)}
          style={{ cursor: "pointer", marginLeft: "5px" }}
        >
          ×
        </span>
      </span>
    ))}
  </div>
</div>

                  
                </div>

                <div className="form-group">
                  <label>for the following stores:</label>
                  <div className="tags-box">
                    {uniqueStoreTags.map((storeName, idx) => (
                      <span key={idx} className="tag">
                        {storeName} <span className="remove">×</span>
                      </span>
                    ))}
                  </div>
                  <button type="button" className="clear-button">
                    Clear Stores
                  </button>
                </div>

                <p className="note">
                  Please note removing stores from this text field will not
                  deselect the store for distribution.
                </p>

                <div className="action-buttons">
                  <button type="button" className="back-button">
                    Back
                  </button>
                  <button type="submit" className="save-button">
                    Save and Continue
                  </button>
                </div>
              </form>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <GroupA />
    <div className="form-container">
      <div className="sidebar">
        <button
          onClick={() => setActiveSection("album")}
          className="btn"
          type="button"
        >
          Album Details
        </button>
        <button
          onClick={() => setActiveSection("music")}
          className="btn"
          type="button"
        >
          Upload Music
        </button>
        <button
          onClick={() => setActiveSection("cover")}
          className="btn"
          type="button"
        >
          Upload Cover Art
        </button>
        <button
          onClick={() => setActiveSection("store")}
          className="btn"
          type="button"
        >
          Select Store
        </button>
      </div>
      <div className="main-content">{renderSection()}</div>
    </div>
    <GroupF />
    <GroupG />
    </>
  );
};

export default MusicDistributionForm;
