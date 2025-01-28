import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import { MdAccountCircle } from "react-icons/md";
import Profile from "./component/profile.js";
import "../components/css/component.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";



const Profilepicture = ({ className }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div >
     
      {user ?  ( <Profile user={user} className={className}/>
      )  : <p><MdAccountCircle className={className} fontSize = "3em" /></p>}
    </div>
  );
};






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
     
      {user ?  ( <Profile user={user}  />
      )  : <p><Link to="/loginPage" className="avatar"  >
                  Login
                  </Link></p>}
    </div>
  );
};
// {user ? <p><IoIosContact />{user.email}</p> : <p><Link to="/log" >
export { Profilepicture, AuthState };