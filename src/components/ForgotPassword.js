import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase"; // Ensure correct Firebase auth import
import { Link } from "react-router-dom";
import Modal from "./Modal"; // Reusable modal component

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [successModal, setSuccessModal] = useState({ show: false, message: "" });
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "The email address is invalid. Please enter a valid email address.",
      "auth/user-not-found": "No account found with this email. Please check the email or sign up.",
      // Add more error codes and messages as needed
    };

    return errorMessages[errorCode] || "An unexpected error occurred. Please chek your detail and try again.";
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessModal({
        show: true,
        message: "A password reset email has been sent to your email address. Please check your inbox.",
      });
    } catch (error) {
      setErrorModal({
        show: true,
        message: getFriendlyErrorMessage(error.code), // Use friendly error message
      });
    }
  };

  const handleModalClose = () => {
    setSuccessModal({ show: false, message: "" });
    setErrorModal({ show: false, message: "" });
  };

  return (
    <div className="forgot-password-container">
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.PNG"
          style={{ width: "64px", height: "64px", paddingBottom: "50px" }}
          alt="Logo"
        />
      </a>
      <h1 className="forgot-password-title">Forgot Password</h1>
      {successModal.show && (
        <Modal
          title="Success"
          message={successModal.message}
          onConfirm={handleModalClose}
          confirmText="Close"
        />
      )}
      {errorModal.show && (
        <Modal
          title="Error"
          message={errorModal.message}
          onConfirm={handleModalClose}
          confirmText="Close"
        />
      )}
      <input
        className="forgot-password-email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <button className="forgot-password-button" onClick={handlePasswordReset}>
        Reset Password
      </button>
      <br />
      <div>
        <Link to="/loginPage" className="avatar2">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
