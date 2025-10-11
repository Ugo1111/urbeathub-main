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
import { Helmet } from 'react-helmet-async';


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

  // State for toggling cover version and compilation album checkboxes
  const [coverVersion, setCoverVersion] = useState(null); // null, true, or false
  const [compilationAlbum, setCompilationAlbum] = useState(null); // null, true, or false
  const [lyrics, setLyrics] = useState(null); // null, true, or false

  // State for dynamic artist and composer fields
  const [artists, setArtists] = useState([""]);
  const [composers, setComposers] = useState([""]);

  // New states for showing/hiding input fields for artist, composer, and time
  const [showArtistInput, setShowArtistInput] = useState(false);
  const [showComposerInput, setShowComposerInput] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [times, setTimes] = useState([]);
  const [timeInput, setTimeInput] = useState("");

  // New state for tracks
  const [tracks, setTracks] = useState([{ title: "", file: null }]);

  // New state for selected stores
  const [selectedStores, setSelectedStores] = useState(() =>
  stores.filter(s => s.name !== "Select All").map(s => s.name)
);

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

  // Artist input handlers
  const handleArtistInputChange = (idx, value) => {
    setArtists(artists.map((a, i) => (i === idx ? value : a)));
  };
  const handleAddArtistInput = () => {
    setArtists([...artists, ""]);
  };
  const handleRemoveArtistInput = (idx) => {
    setArtists(artists.filter((_, i) => i !== idx));
  };

  // Composer input handlers
  const handleComposerInputChange = (idx, value) => {
    setComposers(composers.map((c, i) => (i === idx ? value : c)));
  };
  const handleAddComposerInput = () => {
    setComposers([...composers, ""]);
  };
  const handleRemoveComposerInput = (idx) => {
    setComposers(composers.filter((_, i) => i !== idx));
  };

  // Add time
  const handleAddTime = () => {
    setShowTimeInput(true);
  };
  const handleTimeInputAdd = () => {
    if (timeInput.trim() && !times.includes(timeInput.trim())) {
      setTimes([...times, timeInput.trim()]);
      setTimeInput("");
      setShowTimeInput(false);
    }
  };
  const handleRemoveTime = (t) => {
    setTimes(times.filter(time => time !== t));
  };

  // Handlers for dynamic tracks
  const handleTrackTitleChange = (idx, value) => {
    setTracks(tracks.map((track, i) => i === idx ? { ...track, title: value } : track));
  };
  const handleTrackFileChange = (idx, file) => {
    setTracks(tracks.map((track, i) => i === idx ? { ...track, file } : track));
  };
  const handleAddTrack = () => {
    setTracks([...tracks, { title: "", file: null }]);
  };
  const handleRemoveTrack = (idx) => {
    setTracks(tracks.filter((_, i) => i !== idx));
  };

  const handleStoreCheckboxChange = (storeName) => {
    if (storeName === "Select All") {
      // If Select All is checked, select all stores except "Select All"
      if (selectedStores.length !== stores.length - 1) {
        setSelectedStores(stores.filter(s => s.name !== "Select All").map(s => s.name));
      } else {
        setSelectedStores([]);
      }
    } else {
      if (selectedStores.includes(storeName)) {
        setSelectedStores(selectedStores.filter(name => name !== storeName));
      } else {
        setSelectedStores([...selectedStores, storeName]);
      }
    }
  };

  const isAllSelected = selectedStores.length === stores.filter(s => s.name !== "Select All").length;

  const renderSection = () => {
    switch (activeSection) {
      case "album":
        return (
          <>
          <Helmet>
            <title>Music Distribution</title>
          </Helmet>
          <div className="Album-container">
            <h2>Start Your Music Distribution Process Below</h2>
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
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Italian</option>
                <option>Arabic</option>
              </select>
              <label>Album/Single/EP Title *</label>
              <input type="text" required />
              <label>Album Version</label>
              <input type="text" required />
              <label>Does this release contain cover versions?</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={coverVersion === true}
                    onChange={() => setCoverVersion(true)}
                  /> Yes
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={coverVersion === false}
                    onChange={() => setCoverVersion(false)}
                  /> No
                </label>
              </div>
              {/* Compilation Album */}
              <label>Compilation Album</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={compilationAlbum === true}
                    onChange={() => setCompilationAlbum(true)}
                  /> Yes
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={compilationAlbum === false}
                    onChange={() => setCompilationAlbum(false)}
                  /> No
                </label>
              </div>
              {/* Artist Name */}
              <label>Artist Name *</label>
              <div className="dynamic-list">
                {artists.map((artist, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4 }}>
                    <input
                      type="text"
                      value={artist}
                      onChange={e => handleArtistInputChange(idx, e.target.value)}
                      placeholder="Enter artist name"
                    />
                    {artists.length > 1 && (
                      <button type="button" onClick={() => handleRemoveArtistInput(idx)}>Remove</button>
                    )}
                    {idx === artists.length - 1 && (
                      <button type="button" onClick={handleAddArtistInput}>Add Artist</button>
                    )}
                  </div>
                ))}
              </div>
              {/* Writers/Composers */}
              <div className="section">
                <label>Writers *</label>
                <div className="dynamic-list">
                  {composers.map((composer, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4 }}>
                      <input
                        type="text"
                        placeholder="Composer"
                        value={composer}
                        onChange={e => handleComposerInputChange(idx, e.target.value)}
                        required
                      />
                      {composers.length > 1 && (
                        <button type="button" onClick={() => handleRemoveComposerInput(idx)}>Remove</button>
                      )}
                      {idx === composers.length - 1 && (
                        <button type="button" onClick={handleAddComposerInput}>Add Composer</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Lyrics */}
              <label>Does this release contain lyrics?</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={lyrics === true}
                    onChange={() => setLyrics(true)}
                  /> Yes
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={lyrics === false}
                    onChange={() => setLyrics(false)}
                  /> No
                </label>
              </div>
              <label>Primary Genre</label>
              <select>
                <option>Blues</option>
                <option>Alternative</option>
                <option>Anime</option>
                <option>Brazillian</option>
                <option>Children's Music</option>
                <option>Christian & Gospel</option>
              </select>
              <label>Secondary Genre</label>
              <select>
                <option>Alternative</option>
                <option>Blues</option>
                <option>Anime</option>
                <option>Brazillian</option>
                <option>Children's Music</option>
                <option>Christian & Gospel</option>
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
              <button type="button" onClick={handleAddTime}>Add Time</button>
              {showTimeInput && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Enter time"
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                  />
                  <button type="button" onClick={handleTimeInputAdd}>Add</button>
                  <button type="button" onClick={() => { setShowTimeInput(false); setTimeInput(""); }}>Cancel</button>
                </div>
              )}
              <div className="dynamic-list">
                {times.map((t, idx) => (
                  <span key={idx} className="dynamic-item">
                    {t}
                    <span
                      className="remove"
                      style={{ cursor: "pointer", marginLeft: "5px" }}
                      onClick={() => handleRemoveTime(t)}
                    >×</span>
                  </span>
                ))}
              </div>
              <label>Explicit Content *</label>
              <select>
                <option>Non Explicit</option>
                <option>Explicit</option>
                <option>Cleaned Version</option>
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
          </>
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
            {tracks.map((track, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Track Title"
                  className="input"
                  value={track.title}
                  onChange={e => handleTrackTitleChange(idx, e.target.value)}
                />
                <input
                  type="file"
                  accept="audio/*"
                  className="input"
                  onChange={e => handleTrackFileChange(idx, e.target.files[0])}
                />
                {tracks.length > 1 && (
                  <button type="button" onClick={() => handleRemoveTrack(idx)}>Remove</button>
                )}
                {idx === tracks.length - 1 && (
                  <button type="button" onClick={handleAddTrack}>+ Add Track</button>
                )}
              </div>
            ))}
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
                    checked={
                      store.name === "Select All"
                        ? isAllSelected
                        : selectedStores.includes(store.name)
                    }
                    onChange={() => handleStoreCheckboxChange(store.name)}
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
          className={`btn${activeSection === "album" ? " active-tab" : ""}`}
          type="button"
        >
          Album Details
        </button>
        <button
          onClick={() => setActiveSection("music")}
          className={`btn${activeSection === "music" ? " active-tab" : ""}`}
          type="button"
        >
          Upload Music
        </button>
        <button
          onClick={() => setActiveSection("cover")}
          className={`btn${activeSection === "cover" ? " active-tab" : ""}`}
          type="button"
        >
          Upload Cover Art
        </button>
        <button
          onClick={() => setActiveSection("store")}
          className={`btn${activeSection === "store" ? " active-tab" : ""}`}
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
