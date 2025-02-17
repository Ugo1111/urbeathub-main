import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLink, FaCode } from "react-icons/fa";
import "../css/ShareModal.css"; // Add styles if needed

const ShareModal = ({ song, onClose }) => {
  const shortUrl = `https://bsta.rs/${song.id}`;
  const fullUrl = song.musicUrl || window.location.href;

  const [copied, setCopied] = useState({ short: false, full: false });

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h3>Share Track</h3>
        <div className="song-info">
          <img src={song.coverUrl} alt={song.title} className="cover-img" />
          <div>
            <h4>{song.title}</h4>
            {/* <p>{song.artist || "Unknown Artist"}</p> */}
          </div>
        </div>

        <div className="share-links">
          <div className="link-group">
            <span>Marketplace Short URL</span>
            <div className="link-box">
              <input type="text" value={shortUrl} readOnly />
              <button onClick={() => copyToClipboard(shortUrl, "short")}>
                {copied.short ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="link-group">
            <span>Marketplace Full URL</span>
            <div className="link-box">
              <input type="text" value={fullUrl} readOnly />
              <button onClick={() => copyToClipboard(fullUrl, "full")}>
                {copied.full ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="share-options">
          <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`, "_blank")}>
            <FaFacebook /> Facebook
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${fullUrl}&text=Check%20out%20this%20beat!`, "_blank")}>
            <FaTwitter /> Twitter
          </button>
          <button onClick={() => copyToClipboard(`<iframe src="${fullUrl}" width="100%" height="150"></iframe>`, "embed")}>
            <FaCode /> Embed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;