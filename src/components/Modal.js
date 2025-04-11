import React from "react";
import "./css/modal.css"; // Import CSS for styling the modal

const Modal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          {onCancel ? ( // Show "Confirm" and "Cancel" buttons if onCancel is provided
            <>
              <button className="modal-confirm" onClick={onConfirm}>
                Confirm
              </button>
              <button className="modal-cancel" onClick={onCancel}>
                Cancel
              </button>
            </>
          ) : ( // Otherwise, show a single "OK" button
            <button className="modal-confirm" onClick={onConfirm}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
