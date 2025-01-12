import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import Profile from "./component/profile.js";


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";





const AuthState = ({ fontSize = "1em" }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div style={{ fontSize }}>
     
      {user ?  ( <Profile user={user} />
      )  : <p><Link to="/loginPage" className="avatar"  >
                  Login
                  </Link></p>}
    </div>
  );
};
// {user ? <p><IoIosContact />{user.email}</p> : <p><Link to="/log" >
export default AuthState;