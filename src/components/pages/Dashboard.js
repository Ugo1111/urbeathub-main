import React, { useState, useEffect } from "react";
import "../css/Dashboard.css";
import {
  FaBars,
  FaTachometerAlt,
  FaUpload,
  FaMusic,
  FaChartLine,
  FaDollarSign,
  FaStore,
  FaFileContract,
  FaArrowLeft,
} from "react-icons/fa";
import { IoChatbubbles, IoWallet, IoPerson } from "react-icons/io5";
import Tracks from "./Tracks.js";
import UsersUploadMusicPage from "../component/UsersUploadMusicPage.js";
import Termsandcondition from "./Termsandcondition";
import DashboardComponent from "../component/DashboardComponent";
import EditStoreFront from "../component/EditStoreFront";
import ProducerMessages from "../component/producerMessages";
import Payout from "../component/Payout";
import { ProfileSettingPageWithoutHeaderForDashboardPage } from "../pages/profileSettingPage.js";
import { db, auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState({ username: "", profilePicture: "" });
  const [isProducer, setIsProducer] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/signupPage", { replace: true });
        return;
      }

      try {
        const userDocRef = doc(db, "beatHubUsers", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          navigate("/signupPage", { replace: true });
          return;
        }

        const userData = userSnap.data();

        if (userData.IsProducer !== true) {
          navigate("/signupPage", { replace: true });
          return;
        }

        setUser(userData);
        setIsProducer(true);
      } catch (error) {
        console.error("Error checking producer status:", error);
        navigate("/signupPage", { replace: true });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    if (isMobile) setIsSidebarOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className="dashboard-component-wrapper">
            <DashboardComponent user={user} />
          </div>
        );
      case "Upload Beats":
        return <UsersUploadMusicPage />;
      case "Uploaded Beats":
        return <Tracks />;
      case "Message Admin":
        return <ProducerMessages user={user} />;
      case "Profile":
        return <ProfileSettingPageWithoutHeaderForDashboardPage user={user} />;
      case "Payment & Payouts":
        return <Payout user={user} />;
      case "Store Settings":
        return (
          <div className="dashboard-storefront-wrapper">
            <EditStoreFront user={user} />
          </div>
        );
      case "Agreement & Contracts":
        return (
          <div className="dashboard-terms-wrapper">
            <Termsandcondition />
          </div>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Upload Beats", icon: <FaUpload /> },
    { name: "Uploaded Beats", icon: <FaMusic /> },
    { name: "Message Admin", icon: <IoChatbubbles /> },
    { name: "Profile", icon: <IoPerson /> },
    { name: "Payment & Payouts", icon: <IoWallet /> },
    { name: "Store Settings", icon: <FaStore /> },
    { name: "Agreement & Contracts", icon: <FaFileContract /> },
  ];

  return (
    <div className="form-container">
      {isMobile && (
        <div
          className={`blur ${isSidebarOpen ? "active" : ""}`}
          onClick={toggleSidebar}
        ></div>
      )}

      <div className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Top controls inside sidebar */}
        <div className="sidebar-top-controls">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <button className="dash-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
        </div>

        {isSidebarOpen && (
          <div className="sellbeat-user-profile">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="sellbeat-profile-pic"
              />
            ) : (
              <div className="sellbeat-profile-placeholder">👤</div>
            )}
            <p className="sellbeat-username">{user.username || "User"}</p>
          </div>
        )}

        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleSectionClick(item.name)}
            className={`sidebtn${
              activeSection === item.name ? " active-btns" : ""
            }`}
            title={!isSidebarOpen ? item.name : ""}
          >
            <span className="icon">{item.icon}</span>
            {isSidebarOpen && <span className="text">{item.name}</span>}
          </button>
        ))}
      </div>

      <div className={`main-content ${!isSidebarOpen ? "expanded" : ""}`}>
        {renderSection()}
      </div>
    </div>
  );
}

export default Dashboard;
