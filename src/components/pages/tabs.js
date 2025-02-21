import React, { useState } from "react";
import UploadedMusicComponent from "../component/UploadedMusicComponent.js";
import "../css/musicUpload.css";
import UploadMusicComponent from "../component/UploadMusicComponent.js";
import Metadata from "../component/metaDataUpload.js";
import Monetization from "../component/Monetization.js";
import {GroupA2} from "../component/header.js";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const TabPage = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [lockedTabs, setLockedTabs] = useState({ tab2: true, tab3: true });

  const {
    selectedMusic,
    setSelectedMusic,
    metadata,
    setMetadata,
    monetization,
    setMonetization,
    uploadMusic,
    handlePublish,
    handleSubmit,
    beatId,
    setBeatId,
  } = useMusicUploadContext();

  // Upload function before moving to the next tab
  const handleNext = async () => {
    try {
      if (activeTab === "tab1") {
        if (typeof uploadMusic === "function") {
          await uploadMusic();
        }
        setLockedTabs((prev) => ({ ...prev, tab2: false }));
        setActiveTab("tab2");
      } else if (activeTab === "tab2") {
        if (!beatId) {
          alert("Error: No beat ID found.");
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Reload after 1 second
          return;
        }

        const metadataRef = doc(db, "beats", beatId);
        await getDoc(metadataRef);
        console.log("Metadata uploaded successfully!");

        setLockedTabs((prev) => ({ ...prev, tab3: false }));
        setActiveTab("tab3");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("Upload failed. Please try again.");
    }
  };

  // Final publish function (reloads page after notification)
  const handlingPublish = async () => {
    try {
      alert("Submitting all the information...");

      if (typeof handlePublish === "function") {
        await handlePublish();
      }

      if (typeof handleSubmit === "function") {
        await handleSubmit();
      }

      alert("🎉 Track Published Successfully!");

      // Wait for alert to be shown, then reload after 1 second
      setTimeout(() => {
         alert("🎉 Track Published Successfully!");
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error("Error during publish:", error);
      alert("An error occurred while submitting.");
    }
  };

  // Delete function for the whole record
  const handleDelete = async () => {
    if (!beatId) {
      alert("No record to delete.");
      return;
    }

    const confirmation = window.confirm("Are you sure you want to delete this record?");
    if (!confirmation) return;

    try {
      await deleteDoc(doc(db, "beats", beatId));
      setBeatId(null);
      setActiveTab("tab1");
      setLockedTabs({ tab2: true, tab3: true });
      alert("Record deleted successfully!");

      // Reload page after showing delete alert
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="tab-container">
      <GroupA2 />

      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button className={activeTab === "tab1" ? "active" : ""} disabled>
          Files & Basic Info →
        </button>
        <button className={activeTab === "tab2" ? "active" : ""} disabled={lockedTabs.tab2}>
          Metadata →
        </button>
        <button className={activeTab === "tab3" ? "active" : ""} disabled={lockedTabs.tab3}>
          Monetization
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "tab1" && <UploadMusicComponent selectedMusic={selectedMusic} setSelectedMusic={setSelectedMusic} />}
        {activeTab === "tab2" && <Metadata metadata={metadata} setMetadata={setMetadata} />}
        {activeTab === "tab3" && <Monetization monetization={monetization} setMonetization={setMonetization} />}
      </div>

      {/* Navigation Buttons */}
      <div className="button-container">
        {activeTab === "tab1" && <button className="next-button" onClick={handleNext}>Upload And Move To Next</button>}
        {activeTab === "tab2" && <button className="next-button" onClick={handleNext}>Upload And Move To Next</button>}
        {activeTab === "tab3" && (
          <>
            <button className="publish-button" onClick={handlingPublish}>Publish Track</button>
            <button className="delete-button" onClick={handleDelete}>Delete Record And Start Over</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TabPage;