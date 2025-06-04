import React, { useState } from "react";
import "../css/MusicDistributionForm.css";

const MusicDistributionForm = () => {
  const [activeSection, setActiveSection] = useState("album");

  const renderSection = () => {
    switch (activeSection) {
      case "album":
        return (
          <div>
            <h2 className="section-title">Album Details</h2>
           <select className="section-title">Language
            <option value="" disabled selected>Select Language</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            <option value="german">German</option>  
            </select>
            <label>Album/Single/EP Title</label>
            <input type="text" placeholder="Album/single/EP Title" className="input" required />
            <p>If this release contains the same featuring artist(s) for all tracks, please add the featuring
artist(s) to the album title in this format “(feat. artistname)"</p>
<label>Album Version</label>
            <input type="number" placeholder="Album version" className="input" required />
            <label>Does this release contain cover versions?</label>
<label>
  <input type="radio" name="originalInfo" value="yes" />
  Yes
</label>
<label>
  <input type="radio" name="originalInfo" value="no" />
  No
</label>

          </div>
        );
      case "music":
        return (
          <div>
            <h2 className="section-title">Upload Music</h2>
            <input type="file" accept="audio/*" className="input" />
          </div>
        );
      case "cover":
        return (
          <div>
            <h2 className="section-title">Upload Cover Art</h2>
            <input type="file" accept="image/*" className="input" />
          </div>
        );
      case "store":
        return (
          <div>
            <h2 className="section-title">Select Store</h2>
            <label><input type="checkbox" /> Spotify</label><br />
            <label><input type="checkbox" /> Apple Music</label><br />
            <label><input type="checkbox" /> Deezer</label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-container">
      <div className="sidebar">
        <button onClick={() => setActiveSection("album")} className="btn">Album Details</button>
        <button onClick={() => setActiveSection("music")} className="btn">Upload Music</button>
        <button onClick={() => setActiveSection("cover")} className="btn">Upload Cover Art</button>
        <button onClick={() => setActiveSection("store")} className="btn">Select Store</button>
      </div>
      <div className="main-content">{renderSection()}</div>
    </div>
  );
};

export default MusicDistributionForm;
