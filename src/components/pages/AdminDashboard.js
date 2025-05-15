import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminPage from "./adminPage";
import AdminUploadMusicPage from "./AdminUploadMusicPage";
import UploadedMusicComponent from "../component/UploadedMusicComponent";
import AdminRespondMessages from "./AdminRespondMessages";
import AdminReportsPage from "./AdminReportsPage";
import AdminNegotiationsPage from "./AdminNegotiationsPage";
import AdminUsersPage from "./AdminUsersPage"; // Import AdminUsersPage
import AdminFeedbackPage from "./AdminFeedbackPage"; // Import AdminFeedbackPage
import { MusicUploadProvider } from "../context/MusicUploadProvider";
import "../css/adminDashboard.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // State to track the active tab

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          if (idTokenResult.claims.admin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching ID token:", error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>You are not an admin. You cannot access this page.</div>;
  }

  return (
    <div className="adminDashboard">
      <nav className="adminNav">
        <ul>
          <li onClick={() => setActiveTab("dashboard")}>Dashboard</li>
          <li onClick={() => setActiveTab("upload")}>Upload Music</li>
          <li onClick={() => setActiveTab("uploaded")}>Uploaded Music</li>
          <li onClick={() => setActiveTab("respond")}>Respond to Messages</li>
          <li onClick={() => setActiveTab("reports")}>Reports</li>
          <li onClick={() => setActiveTab("negotiations")}>Negotiations</li>
          <li onClick={() => setActiveTab("users")}>Users</li> {/* Add Users tab */}
          <li onClick={() => setActiveTab("feedback")}>Feedback</li> {/* Add Feedback tab */}
        </ul>
      </nav>

      <div className="adminContent">
        {activeTab === "dashboard" && <AdminPage />}
        {activeTab === "upload" && (
          <MusicUploadProvider>
            <AdminUploadMusicPage />
          </MusicUploadProvider>
        )}
        {activeTab === "uploaded" && <UploadedMusicComponent />}
        {activeTab === "respond" && <AdminRespondMessages />}
        {activeTab === "reports" && <AdminReportsPage />}
        {activeTab === "negotiations" && <AdminNegotiationsPage />}
        {activeTab === "users" && <AdminUsersPage />} {/* Render AdminUsersPage */}
        {activeTab === "feedback" && <AdminFeedbackPage />} {/* Render AdminFeedbackPage */}
      </div>
    </div>
  );
};

export default AdminDashboard;
