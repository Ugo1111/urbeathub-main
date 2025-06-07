import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from "../../firebase/firebase"; // Import Firestore & Auth
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import UploadedBeatListComponent from "../component/UploadedBeatListComponent.js";
import Payout from "../component/Payout.js";
import DashboardComponent from "../component/DashboardComponent.js";
import ProducerMessages from "../component/producerMessages.js";
import Termsandcondition from "../pages/Termsandcondition.js";
import { GrCloudUpload } from "react-icons/gr";
import { IoReturnUpBackSharp, IoMusicalNotes, IoChatbubbles, IoWallet, IoPerson, IoStatsChart, IoDocumentTextOutline, IoStorefront } from "react-icons/io5";
import { ProfileSettingPageWithoutHeaderForDashboardPage } from "../pages/profileSettingPage.js"; // Updated import
import UsersUploadMusicPage from "../component/UsersUploadMusicPage.js";
import EditStoreFront from "../component/EditStoreFront"; // Ensure this is a default import

const SellBeatPage = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [user, setUser] = useState({ username: "", profilePicture: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // List of possible background colors
  const colors = [
    "#e74d3c9b", // Red
    "#3498dbaa", // Blue
    "#2ecc70a5", // Green
    "#f39d1294", // Orange
    "#9c59b6a3", // Purple
    "#1abc9c9d", // Teal
  ];

  // Function to get a random color from the colors list
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  // Set the random hover and active color for each link
  const setRandomHoverColor = () => {
    const randomColor = getRandomColor();
    document.documentElement.style.setProperty('--random-hover-color', randomColor);
    document.documentElement.style.setProperty('--random-active-color', randomColor);
  };

  useEffect(() => {
    // Set random hover and active colors on initial load
    setRandomHoverColor();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 746);
    };

    window.addEventListener('resize', handleResize);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "beatHubUsers", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser(userDoc.data()); // Set user data
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, []);

  return (
    <div className='sellbeat-body'>
      <nav className='navbarbody'>
        <Link to="/#" className='sellbeat-goBack-btn'>
          <IoReturnUpBackSharp />Go Back
        </Link>

        {/* User Profile Section */}
        <div className="sellbeat-user-profile">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="sellbeat-profile-pic" />
          ) : (
            <div className="sellbeat-profile-placeholder">👤</div> // Placeholder if no picture
          )}
          <p className="sellbeat-username">{user.username || "User"}</p>
        </div>

        <ul className='navbarContainer'>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("performance")}
              style={{
                backgroundColor: activeComponent === "performance" ? getRandomColor() : "",
              }}
              className={activeComponent === "performance" ? "active" : ""}
            >
              {isMobile ? <IoStatsChart /> : "Performance"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("upload")}
              style={{
                backgroundColor: activeComponent === "upload" ? getRandomColor() : "",
              }}
              className={activeComponent === "upload" ? "active" : ""}
            >
              {isMobile ? <GrCloudUpload />: "Upload A Track"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("uploaded")}
              style={{
                backgroundColor: activeComponent === "uploaded" ? getRandomColor() : "",
              }}
              className={activeComponent === "uploaded" ? "active" : ""}
            >
              {isMobile ? <IoMusicalNotes /> : "Your Listed Tracks"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("messages")}
              style={{
                backgroundColor: activeComponent === "messages" ? getRandomColor() : "",
              }}
              className={activeComponent === "messages" ? "active" : ""}
            >
              {isMobile ? <IoChatbubbles /> : "Customer Messages"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("payout")}
              style={{
                backgroundColor: activeComponent === "payout" ? getRandomColor() : "",
              }}
              className={activeComponent === "payout" ? "active" : ""}
            >
              {isMobile ? <IoWallet /> : "Payout Information"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("profilePage")}
              style={{
                backgroundColor: activeComponent === "profilePage" ? getRandomColor() : "",
              }}
              className={activeComponent === "profilePage" ? "active" : ""}
            >
              {isMobile ? <IoPerson /> : "Profile Page"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("Termsandcondition")}
              style={{
                backgroundColor: activeComponent === "Termsandcondition" ? getRandomColor() : "",
              }}
              className={activeComponent === "Termsandcondition" ? "active" : ""}
            >
              {isMobile ? <IoDocumentTextOutline /> : "Terms and Conditions"}
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={() => setActiveComponent("editStoreFront")}
              style={{
                backgroundColor: activeComponent === "editStoreFront" ? getRandomColor() : "",
              }}
              className={activeComponent === "editStoreFront" ? "active" : ""}
            >
              {isMobile ? <IoStorefront /> : "Edit Store Front"}
            </Link>
          </li>
        </ul>
      </nav>

      <div>
        {activeComponent === "uploaded" && <UploadedBeatListComponent />}
        {activeComponent === "upload" && <UsersUploadMusicPage />}
        {activeComponent === "performance" && <DashboardComponent />}
        {activeComponent === "profilePage" && <ProfileSettingPageWithoutHeaderForDashboardPage />}
        {activeComponent === "payout" && <Payout />}
        {activeComponent === "messages" && <ProducerMessages />}
        {activeComponent === "Termsandcondition" && <Termsandcondition />}
        {activeComponent === "editStoreFront" && <EditStoreFront />}
        {activeComponent === null && <DashboardComponent />}
      </div>
    </div>
  );
};

export default SellBeatPage;