import React, { useState, useEffect } from "react";
import { signUp, signInWithGoogle } from "../firebase/authFunctions"; // Import signInWithGoogle
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // Import axios for fetching location
import { FcGoogle } from "react-icons/fc"; // Import Google icon

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [error, setError] = useState(null); // State to handle errors
  const [IsProducer, setIsProducer] = useState(false); // State for IsProducer
  const [location, setLocation] = useState("Fetching location..."); // State for location
  const [locationFetched, setLocationFetched] = useState(false); // Flag for location readiness
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null); // State to hold auth object

  // Fetch user's location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const { city, country_name: country } = response.data;
        if (city && country) {
          setLocation(`${city}, ${country}`);
        } else {
          setLocation("Location unavailable");
        }
        setLocationFetched(true); // Mark location as fetched
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Location unavailable");
        setLocationFetched(true); // Mark location as fetched even if failed
      }
    };

    fetchLocation();
  }, []);

  // Initialize auth when component mounts
  useEffect(() => {
    const authInstance = getAuth(); // Initialize auth here
    setAuth(authInstance); // Set auth state

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        alert("Sign-up successful!");
        navigate("/loginPage"); // Redirect to login page after sign-up
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, [navigate]);

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      alert(`Welcome ${user.displayName || "Google User"}!`);
      navigate("/homePage"); // Redirect to home page after Google Sign-Up
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUp = async () => {
    if (!auth) return;
    try {
      setError(null);
      console.log("Location being sent to Firestore:", location); // Log location value
      const { user } = await signUp(email, password, username, IsProducer, location); // Pass location to signUp
      alert("Sign-up successful!"); // Updated success message
      navigate("/loginPage"); // Redirect to login page after sign-up
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-form-container">
      <a href="/" className="Headerlogo">
        <img
          src="./beathub1.PNG"
          style={{ width: "100px", height: "164px", paddingBottom: "70px" }}
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
      <button
        className="login-button"
        onClick={handleSignUp}
        disabled={!locationFetched} // Disable button until location is ready
        style={{
          backgroundColor: locationFetched ? "#db3056" : "#ccc", // Change color based on readiness
          cursor: locationFetched ? "pointer" : "not-allowed",
        }}
      >
        Sign Up
      </button>
      <br />
      <button
        className="google-signup-button"
        onClick={handleGoogleSignUp}
        style={{
          backgroundColor: "#4285F4",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FcGoogle size="1.5em" /> {/* Add Google icon */}
        Sign Up with Google
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
