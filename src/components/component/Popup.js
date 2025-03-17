import React from "react";
import "../css/popup.css"; // Import CSS for the popup

const Popup = ({ children, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="popup-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
