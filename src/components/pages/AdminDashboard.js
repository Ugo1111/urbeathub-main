import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminPage from "./adminPage";
import AdminUploadMusicPage from "./AdminUploadMusicPage"; // Import AdminUploadMusicPage
import UploadedMusicComponent from "../component/UploadedMusicComponent";
import AdminRespondMessages from "./AdminRespondMessages"; // Import AdminRespondMessages
import AdminReportsPage from "./AdminReportsPage"; // Import AdminReportsPage
import AdminNegotiationsPage from "./AdminNegotiationsPage"; // Import AdminNegotiationsPage
import { MusicUploadProvider } from "../context/MusicUploadProvider"; // Import the provider
import "../css/adminDashboard.css"; // Import CSS for styling
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase auth

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
          <li><Link to="/admin">Dashboard</Link></li> {/* Update the link to point to /admin */}
          <li><Link to="/admin/upload">Upload Music</Link></li>
          <li><Link to="/admin/uploaded">Uploaded Music</Link></li>
          <li><Link to="/admin/respond">Respond to Messages</Link></li> {/* Add link to respond to messages */}
          <li><Link to="/admin/reports">Reports</Link></li> {/* Add link to reports */}
          <li><Link to="/admin/negotiations">Negotiations</Link></li> {/* Add link to negotiations */}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<AdminPage />} /> {/* Update the route to match the link */}
        <Route path="/upload" element={
          <MusicUploadProvider>
            <AdminUploadMusicPage />
          </MusicUploadProvider>
        } /> {/* Wrap AdminUploadMusicPage with MusicUploadProvider */}
        <Route path="/uploaded" element={<UploadedMusicComponent />} />
        <Route path="/respond" element={<AdminRespondMessages />} /> {/* Add route for responding to messages */}
        <Route path="/reports" element={<AdminReportsPage />} /> {/* Add route for reports */}
        <Route path="/negotiations" element={<AdminNegotiationsPage />} /> {/* Add route for negotiations */}
      </Routes>
    </div>
  );
};

export default AdminDashboard;
