import React, { useState, useEffect } from "react";
import "../css/component.css";
import AuthState from "../AuthState";
import Logout from "../logout";
import { IoIosContact } from "react-icons/io";
import { auth, db } from "../../firebase/firebase"; // Ensure Firestore is initialized in firebase.js
import { doc, getDoc } from "firebase/firestore"; // Importing getDoc to fetch a single document
import { Link } from "react-router-dom"; 

export default function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null); // State to store single user data
  const [loading, setLoading] = useState(true); // To track if data is still loading
  const [isProducer, setIsProducer] = useState(false); // State to track if user is a producer

  // Fetch user data from Firestore based on auth user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser; // Get the current logged-in user
        if (user) {
          const docRef = doc(db, "beatHubUsers", user.uid); // Use uid instead of email
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data); // Store the user's data in state
            setIsProducer(data.IsProducer === true); // Check if IsProducer is true
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
        <p>
          {/* If userData exists and has profilePicture, use it */}
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Profile"
              className="profile-pic" // Add a class for styling the image
              style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <IoIosContact className="" /> // Fallback icon
          )}
        </p>
      </button>
      {isDropdownOpen && (
        <div id="myDropdown" className="dropdown-content">
          {
            // Display user data if available
            userData ? (
              <>
                <Link to="/profileSettingPage" className="avatar2"> {/* Updated route */}
                  <a href="#home" className="userEmail">
                    {/* Display username and profile picture */}
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="profile-pic"
                      />
                    ) : (
                      <IoIosContact className="default-icon" style={{ marginRight: "8px" }} />
                    )}
                    {userData.username}
                  </a>
                </Link>
                <hr />
              </>
            ) : (
              <p>User data not found</p>
            )
          }
           <Link to="/FavouritePage" className="">Favourite</Link>
         
          <Link to="/purchasedPage">Purchased</Link>

          <Link to="/CartPage" className="">
        Cart
          </Link>

          <Link to="/coverArt" className="">
        Cover Art
          </Link>

         
          {isProducer && (
            <Link to="/sellBeatPage" className="">Dashboard</Link>
          )}

           
          <div><Logout /></div>
        </div>
      )}
    </div>
  );
}