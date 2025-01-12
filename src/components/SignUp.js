import React, { useState } from "react";
import { signUp } from "../firebase/authFunctions";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";


const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    signUp(email, password);
  };

 




return (
  <div className="login-form-container" >

  <a href="/" className="Headerlogo">
    <img src="./beathub1.jpg" style={{ width: "64px", height: "64px" , paddingBottom: "50px"}}></img>
  </a>
 
    <h1 className="login-title">Continue With</h1><br></br>
    <input
    className="login-email"
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    /> <br></br>
    <input
    className="login-password"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    /><br></br>
    <button className="login-button" onClick={handleSignUp}>Sign Up</button>
   <br></br>
  
   <div><hr></hr>
<span>  Already have and account? </span>
   <Link to="/loginPage" className="avatar2"  >
    Log in Here
                </Link>
                </div>
  </div>
);
};










export default SignUp;