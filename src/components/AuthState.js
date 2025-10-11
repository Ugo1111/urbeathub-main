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
import BeatUploadPopup from "./component/BeatUploadPopup";


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
          <MdAccountCircle data-testid="default-icon" className={className} fontSize="3em" />

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
            const isProducerValue = !!userDoc.data().IsProducer; // Ensure boolean value
            console.log("Fetched IsProducer:", isProducerValue); // Debug log
            setIsProducer(isProducerValue); // Update state with boolean
          } else {
            console.log("User document does not exist. Defaulting IsProducer to false.");
            setIsProducer(false); // Default to false if no document exists
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsProducer(false); // Default to false on error
        }
      } else {
        console.log("No user logged in. Resetting IsProducer to false.");
        setUser(null);
        setIsProducer(false); // Reset producer state if no user
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    console.log("AuthState Rendered - user:", user, "isProducer:", isProducer); // Debug log
  }, [user, isProducer]);

  const handleStartSelling = async () => {
    if (!user) {
      navigate("/startsellingpage"); // Redirect to sign-up page if user is not signed in
      return;
    }

    setShowModal(true); // Show the confirmation modal if user is signed in
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
        <div className="profile-dropdown">
          <Profile user={user} /> {/* Ensure Profile renders correctly */}
          {!isProducer && ( // Ensure button is visible only if user is logged in and not a producer
            <button className="startselling" onClick={handleStartSelling}>
              Start Selling
            </button>
          )}
        </div>
      ) : (
        <div className="auth-buttons-container"> 
          <Link to="/loginPage" className="avatar">
            Sign In
          </Link>
          <Link to="/signUpPage" className="avatar">
            Sign Up
          </Link>
          <button className="startselling" onClick={handleStartSelling}>
            Start Selling
          </button>
        </div>
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
     {/* {user && isProducer && <BeatUploadPopup user={user} />}*/}
    </div>
    
  );
};

export { Profilepicture, AuthState };