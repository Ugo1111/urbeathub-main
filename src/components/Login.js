import React, { useState } from "react";
import { login, signInWithGoogle } from "../firebase/authFunctions"; // Import Google Sign-In function
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; // Import Google icon

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null); // Clear any previous errors
      await login(email, password); // Attempt login
      navigate("/"); // Navigate to the homepage after successful login
    } catch (error) {
      setError(error.message); // Show user-friendly error message
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle(); // Call Google Sign-In function
      alert(`Welcome back ${user.displayName || "Google User"}!`);
      navigate("/"); // Navigate to the homepage after successful login
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <div className="login-form-container">
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.PNG"
          style={{ width: "64px", height: "164px", paddingBottom: "50px" }}
          alt="Logo"
        />
      </a>

      <h1 className="login-title">Log In</h1>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
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
      <button
        onClick={handleGoogleLogin}
        style={{
          backgroundColor: "#4285F4",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FcGoogle size="1.5em" /> {/* Add Google icon */}
        Log In with Google
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