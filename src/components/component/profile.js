import React, { useState, useEffect } from "react";
import "../css/component.css";
import AuthState from "../AuthState";
import Logout from "../logout";
import { IoIosContact } from "react-icons/io";
import { auth, db } from "../../firebase/firebase"; // Ensure Firestore is initialized in firebase.js
import { doc, getDoc } from "firebase/firestore"; // Importing getDoc to fetch a single document

export default function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null); // State to store single user data
  const [loading, setLoading] = useState(true); // To track if data is still loading

  // Fetch user data from Firestore based on auth user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser; // Get the current logged-in user
        if (user) {
          // Fetch the user's document from Firestore by their uid
          const docRef = doc(db, "users", user.uid); // Assuming you store users in 'users' collection
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data()); // Store the user's data in state
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetch is complete
      }
    };

    fetchUserData();
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropbtn">
        <p> <IoIosContact className=""/></p>
      </button>
      {isDropdownOpen && (
        <div id="myDropdown" className="dropdown-content">
          {loading ? (
            <p>Loading user data...</p>
          ) : (
            // Display user data if available
            userData ? (
              <>
                <a href="#home" className="userEmail">
                  <IoIosContact className="" /> {userData.username} {/* Assuming 'email' is stored */}
                </a>
                <hr />
              </>
            ) : (
              <p>User data not found</p>
            )
          )}
          <a href="#home">Favourite</a>
          <a href="#about">Purchased</a>
          <a href="#about">Chart</a>
          <div><Logout /></div>
        </div>
      )}
    </div>
  );
}