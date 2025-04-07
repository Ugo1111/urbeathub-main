import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import { MdAccountCircle } from "react-icons/md";
import Profile from "./component/profile.js";
import "../components/css/component.css";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Ensure Firestore is initialized
import ReactModal from "react-modal"; // Import React Modal

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

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Cleanup on unmount
      }
    };
  }, []);

  return (
    <div >
     
      {user ?  ( <Profile user={user} className={className}/>
      )  : <p><MdAccountCircle className={className} fontSize = "3em" /></p>}
    </div>
  );
};






const AuthState = ({ fontSize = "small" }) => {
  const [user, setUser] = useState(null);
  const [isProducer, setIsProducer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control confirmation modal visibility
  const [successModalOpen, setSuccessModalOpen] = useState(false); // State to control success modal visibility
  const navigate = useNavigate(); // Hook to navigate programmatically

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "beatHubUsers", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsProducer(userData.IsProducer === true); // Check if isProducer is true
          } else {
            setIsProducer(false); // Default to false if no document exists
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsProducer(false); // Default to false on error
        }
      } else {
        setIsProducer(false); // Reset if no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleStartSelling = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, "beatHubUsers", user.uid);
        await updateDoc(userDocRef, { IsProducer: true }); // Update Firestore
        setIsProducer(true); // Update local state
        setSuccessModalOpen(true); // Open success modal
        setTimeout(() => {
          setSuccessModalOpen(false); // Close success modal after 4 seconds
          navigate("/sellBeatPage"); // Navigate to the sellBeatPage
        }, 2500);
      }
    } catch (error) {
      console.error("Error updating IsProducer:", error);
      alert("Failed to update. Please try again.");
    } finally {
      setIsModalOpen(false); // Close the confirmation modal
    }
  };

  return (
    <div style={{ fontSize }}>
     
      {user ?  ( <Profile user={user}  />
      )  : <p><Link to="/loginPage" className="avatar"  >
                  Login
                  </Link></p>}
    </div>

    
  );
};

export { Profilepicture, AuthState };