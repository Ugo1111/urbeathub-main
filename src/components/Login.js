import React, { useState, useEffect } from "react";
import { login } from "../firebase/authFunctions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();
  const auth = getAuth();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // Redirect if user is authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogin = async () => {
    try {
      setError(null); // Clear any previous errors
      const userCredential = await login(email, password); // Attempt login
      if (userCredential) {
        navigate("/"); // Navigate only if login is successful
      }
    } catch (error) {
      setError(error.message); // Display error on login failure
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
      <div>
        <span>Don't have an account? </span>
        <Link to="/signUpPage" className="avatar2">
          Sign Up Here
        </Link>
      </div>
    </div>
  );
};

export default Login;