import React, { useState, useEffect } from "react";
import { login } from "../firebase/authFunctions";
import { Link, useNavigate } from "react-router-dom"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState(""); // User email
  const [password, setPassword] = useState(""); // User password
  const navigate = useNavigate(); // React Router's navigation function
  const auth = getAuth(); // Firebase Authentication instance

  // Redirect if the user is already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // Redirect to dashboard if signed in
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [auth, navigate]);

  const handleLogin = async () => {
    try {
      await login(email, password); // Perform login
      navigate("/"); // Redirect after successful login
    } catch (error) {
      console.error("Login error:", error.message); // Log error on failure
    }
  };

  return (
    <div className="login-form-container">
      {/* Logo */}
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.jpg"
          style={{ width: "64px", height: "64px", paddingBottom: "50px" }}
          alt="Logo"
        />
      </a>

      {/* Form Title */}
      <h1 className="login-title">Continue With</h1>

      {/* Email Input */}
      <input
        className="login-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password Input */}
      <input
        className="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Login Button */}
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>

      {/* Link to Signup Page */}
      <div>
        <span>Click here to </span>
        <Link to="/signUpPage" className="avatar2">
          sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;