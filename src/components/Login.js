import React, { useState, useEffect } from "react";
import { login } from "../firebase/authFunctions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal"; // Import the reusable Modal component

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState({ show: false, message: "" }); // State for error modal
  const navigate = useNavigate();
  const auth = getAuth();

  // Redirect if already logged in and email is verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          navigate("/"); // Redirect if user is authenticated and email is verified
        } else {
          await auth.signOut(); // Sign out unverified users
          setErrorModal({
            show: true,
            message: "A verification email was sent to your email address. Please verify your email before logging in.",
          });
        }
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogin = async () => {
    try {
      setErrorModal({ show: false, message: "" }); // Clear any previous errors
      const userCredential = await login(email, password); // Attempt login
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        await auth.signOut(); // Sign the user out
        setErrorModal({
          show: true,
          message: "Your email is not verified. Please check your inbox and verify your email before logging in.",
        });
        return; // Stop further execution
      }

      // Navigate to the homepage if the email is verified
      navigate("/");
    } catch (error) {
      setErrorModal({ show: true, message: error.message }); // Show user-friendly error message
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

      <h1 className="login-title">Log In</h1>
      {errorModal.show && (
        <Modal
          title="Login Error"
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
      <button className="login-button" onClick={handleLogin}>
        Log In
      </button>
      <br />
      <div>
        <span>Don't have an account? </span>
        <Link to="/signUpPage" className="avatar2">
          Sign Up Here
        </Link>
      </div>
      <div>
        <Link to="/forgotPassword" className="avatar2">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
};

export default Login;