import React, { useState } from "react";
import { signUp } from "../firebase/authFunctions"; // Ensure correct import path
import { useNavigate, Link } from "react-router-dom";
import Modal from "./Modal"; // Import the reusable Modal component

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [IsProducer, setIsProducer] = useState(false); // State for IsProducer
  const [errorModal, setErrorModal] = useState({ show: false, message: "" }); // State for error modal
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      setErrorModal({ show: false, message: "" }); // Clear any previous errors
      const { user, requiresVerification } = await signUp(email, password, username, IsProducer);
      if (requiresVerification) {
        setErrorModal({
          show: true,
          message: "Sign-up successful! A verification email has been sent to your email address. Please verify your email before logging in.",
        });
        navigate("/loginPage"); // Redirect to login page after sign-up
      }
    } catch (error) {
      setErrorModal({ show: true, message: error.message }); // Show error modal
    }
  };

  const handleErrorModalClose = () => {
    setErrorModal({ show: false, message: "" }); // Close the error modal
  };

  return (
    <div className="login-form-container">
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.PNG"
          style={{ width: "64px", height: "64px", paddingBottom: "50px" }}
          alt="Logo"
        />
      </a>

      <h1 className="login-title">Sign Up</h1>
      {errorModal.show && (
        <Modal
          title="Sign-Up Message"
          message={errorModal.message}
          onConfirm={handleErrorModalClose}
          confirmText="Close"
        />
      )}
      <input
        className="login-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        className="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <input
        className="login-username" // New input field for username
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <div className="radio-group-container">
        <div className="radio-group">
          <input
            type="radio"
            id="sellBeats"
            name="IsProducer"
            checked={IsProducer === true}
            onChange={() => setIsProducer(true)}
          />
          <label htmlFor="sellBeats">Sell Beats</label>
        </div>
        <div className="radio-group">
          <input
            type="radio"
            id="buyBrowse"
            name="IsProducer"
            checked={IsProducer === false}
            onChange={() => setIsProducer(false)}
          />
          <label htmlFor="buyBrowse">Buy and Browse</label>
        </div>
      </div>
      <button className="login-button" onClick={handleSignUp}>
        Sign Up
      </button>
      <br />
      <div>
        <hr />
        <span>Already have an account? </span>
        <Link to="/loginPage" className="avatar2">
          Log in Here
        </Link>
      </div>
    </div>
  );
};

export default SignUp;