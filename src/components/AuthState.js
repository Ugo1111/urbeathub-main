import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase"; 
import { SlOptionsVertical } from "react-icons/sl";
import { MdAccountCircle } from "react-icons/md";
import Profile from "./component/profile.js";
import "../components/css/component.css";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Import updateDoc and getDoc for Firestore updates
import { db } from "../firebase/firebase"; // Import Firestore instance
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Modal from "./Modal"; // Import the new Modal component

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

const Profilepicture = ({ className }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email }); // Store uid and email
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div>
      {user ? (
        <Profile user={user} className={className} /> // Pass uid to Profile component
      ) : (
        <p>
          <MdAccountCircle className={className} fontSize="3em" />
        </p>
      )}
    </div>
  );
};

const AuthState = ({ fontSize = "1em" }) => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control confirmation modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control success modal visibility
  const [isProducer, setIsProducer] = useState(false); // State to track if user is a producer
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email }); // Store uid and email
        try {
          const userDocRef = doc(db, "beatHubUsers", currentUser.uid); // Reference to the user's document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setIsProducer(userDoc.data().IsProducer === true); // Check if IsProducer is true
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setIsProducer(false); // Reset producer state if no user
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleStartSelling = async () => {
    if (user) {
      setShowModal(true); // Show the confirmation modal
    }
  };

  const handleModalConfirm = async () => {
    try {
      const userDocRef = doc(db, "beatHubUsers", user.uid); // Reference to the user's document
      await updateDoc(userDocRef, { IsProducer: true }); // Update IsProducer to true
      setIsProducer(true); // Update local state
      setShowSuccessModal(true); // Show the success modal
    } catch (error) {
      console.error("Error updating IsProducer:", error);
      alert("Failed to update producer status. Please try again.");
    } finally {
      setShowModal(false); // Hide the confirmation modal
    }
  };

  const handleModalCancel = () => {
    setShowModal(false); // Hide the confirmation modal
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false); // Hide the success modal
    navigate("/sellBeatPage"); // Redirect to the dashboard
  };

  return (
    <div style={{ fontSize }}>
      {user ? (
        <Profile user={user} />
      ) : (
        <p>
          <Link to="/loginPage" className="avatar">
            Login
          </Link>
        </p>
      )}
      {!isProducer && ( // Conditionally render the button if the user is not a producer
        <button className="startselling" onClick={handleStartSelling}>
          start selling
        </button>
      )}
      {showModal && (
        <Modal
          title="Become a Producer"
          message="Are you sure you want to start selling beats? This will make you a producer."
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
      {showSuccessModal && (
        <Modal
          title="Success"
          message="You are now a producer!"
          onConfirm={handleSuccessModalClose} // Use the same handler for the single "OK" button
        />
      )}
    </div>
  );
};

export { Profilepicture, AuthState };