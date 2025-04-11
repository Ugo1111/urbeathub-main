import React, { useState, useEffect } from "react";
import { signUp } from "../firebase/authFunctions";  // Assuming you have your signUp function in this file
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");  // New state for username
  const [error, setError] = useState(null); // State to handle errors
  const [IsProducer, setIsProducer] = useState(""); // State for IsProducer
  const navigate = useNavigate();
  const auth = getAuth();

  // Redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // Redirect if user is already authenticated
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, [auth, navigate]);

  const handleSignUp = async () => {
    try {
      setError(null); // Clear any previous errors
      const userCredential = await signUp(email, password, username, IsProducer); // Pass IsProducer along with other values
      if (userCredential) {
        navigate("/"); // Redirect on successful sign-up
      }
    } catch (error) {
      setError(error.message); // Capture and display error
    }
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
          value="true"
          checked={IsProducer === "true"}
          onChange={(e) => setIsProducer(e.target.value)}
        />
        <label htmlFor="sellBeats">Sell Beats</label>
      </div>
      <div className="radio-group">
        <input
          type="radio"
          id="buyBrowse"
          name="IsProducer"
          value="false"
          checked={IsProducer === "false"}
          onChange={(e) => setIsProducer(e.target.value)}
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