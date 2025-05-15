import React, { useState, useEffect } from "react";
import { signUp } from "../firebase/authFunctions"; // Ensure correct import path
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");  // New state for username
  const [error, setError] = useState(null); // State to handle errors
  const [IsProducer, setIsProducer] = useState(false); // State for IsProducer
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);  // State to hold auth object

  // Initialize auth when component mounts
  useEffect(() => {
    const authInstance = getAuth(); // Initialize auth here
    setAuth(authInstance); // Set auth state

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        alert("Sign-up successful! A verification email has been sent to your email address. Please verify your email before logging in.");
        navigate("/loginPage"); // Redirect to login page after sign-up
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, [navigate]);

  const handleSignUp = async () => {
    if (!auth) return;
    try {
      setError(null);
      const { user, requiresVerification } = await signUp(email, password, username, IsProducer);
      if (requiresVerification) {
        alert("Sign-up successful! A verification email has been sent to your email address. Please verify your email before logging in.");
        navigate("/loginPage"); // Redirect to login page after sign-up
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-form-container">
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.PNG"
          style={{ width: "100px", height: "100px", paddingBottom: "50px" }}
          alt="Logo"
        />
      </a>

      <h1 className="login-title">Sign Up</h1>
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
      <input
        className="login-username"  // New input field for username
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
