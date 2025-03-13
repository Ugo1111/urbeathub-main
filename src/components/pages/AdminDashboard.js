import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminPage from "./adminPage";
import AdminUploadMusicPage from "./AdminUploadMusicPage"; // Import AdminUploadMusicPage
import UploadedMusicComponent from "../component/UploadedMusicComponent";
import AdminRespondMessages from "./AdminRespondMessages"; // Import AdminRespondMessages
import { MusicUploadProvider } from "../context/MusicUploadProvider"; // Import the provider
import "../css/adminDashboard.css"; // Import CSS for styling

const AdminDashboard = () => {
  return (
    <div className="adminDashboard">
      <nav className="adminNav">
        <ul>
          <li><Link to="/admin">Dashboard</Link></li> {/* Update the link to point to /admin */}
          <li><Link to="/admin/upload">Upload Music</Link></li>
          <li><Link to="/admin/uploaded">Uploaded Music</Link></li>
          <li><Link to="/admin/respond">Respond to Messages</Link></li> {/* Add link to respond to messages */}
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
      </Routes>
    </div>
  );
};

export default AdminDashboard;
