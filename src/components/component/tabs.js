import React, { useState, useEffect, useCallback } from "react";
import UploadedMusicComponent from "./UploadedMusicComponent.js";
import "../css/musicUpload.css";
import UploadMusicComponent from "./UploadMusicComponent.js";
import Metadata from "./metaDataUpload.js";
import Monetization from "./Monetization.js";
import { GroupA2 } from "./header.js";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useMusicUploadContext } from "../context/MusicUploadProvider.js";
import { doc, deleteDoc, setDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Popup from "./Popup"; // Ensure Popup is correctly imported
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AudioTagger from "../pages/PageOne"; // Import AudioTagger component

const TabPage = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [lockedTabs, setLockedTabs] = useState({ tab2: false, tab3: false });
  const [showPopup, setShowPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [zipFile, setZipFile] = useState(null);

  const {
    selectedMusic,
    setSelectedMusic,
    metadata,
    setMetadata,
    monetization,
    setMonetization,
    beatId,
    setBeatId,
    audioFileMp3,
    setAudioFileMp3,
    audioFileWav,
    setAudioFileWav,
    coverArt,
    setCoverArt,
    coverPreview,
    setCoverPreview,
    processedAudioFile,
    setProcessedAudioFile,
    musicTitle,
  } = useMusicUploadContext();

  useEffect(() => {
    // Ensure selectedMusic state is preserved when navigating between tabs
    if (!selectedMusic) {
      setSelectedMusic({
        mp3: null,
        wave: null,
        coverArt: null,
        title: "",
      });
    }
  }, [selectedMusic, setSelectedMusic]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
      } else {
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field, value) => {
    setSelectedMusic((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = (tab) => {
    setActiveTab(tab);
  };

  const handleFileSelect = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === "musicMp3" && file.type.startsWith("audio/mpeg")) {
      setAudioFileMp3(file);
    } else if (fileType === "musicWav" && file.type.startsWith("audio/wav")) {
      setAudioFileWav(file);
    } else if (fileType === "cover" && file.type.startsWith("image/")) {
      setCoverArt(file);
      setCoverPreview(URL.createObjectURL(file));
    } else if (fileType === "archive") {
      const allowedExtensions = ["zip", "rar"];
      if (!allowedExtensions.includes(file.name.split(".").pop().toLowerCase())) {
        alert("Invalid file type. Please upload a ZIP or RAR file.");
        return;
      }
      setZipFile(file);
    } else {
      alert("Invalid file type.");
    }
  };

  const handleProcessedAudio = (audioFile) => {
    setProcessedAudioFile(audioFile);
  };

  const handleUpload = async () => {
    try {
      if (!email) {
        throw new Error("Please ensure you are logged in.");
      }

      setShowPopup(true);
      setUploadProgress(0);
      setErrorMessage("");

      // Upload Files & Basic Info
      alert("Uploading Files & Basic Info...");
      if (!musicTitle) {
        throw new Error("Please provide a music title.");
      }
      if (!audioFileMp3 || !audioFileWav) {
        throw new Error("Both MP3 and WAV files must be uploaded.");
      }
      if (!processedAudioFile) {
        throw new Error("Please process the audio file with watermark.");
      }

      const musicCollectionRef = collection(db, "beats");
      const newDocRef = doc(musicCollectionRef);

      setBeatId(newDocRef.id);

      const storagePath = `beats/${newDocRef.id}`;
      const musicRefMp3 = audioFileMp3 ? ref(storage, `${storagePath}/${audioFileMp3.name}`) : null;
      const musicRefWav = audioFileWav ? ref(storage, `${storagePath}/${audioFileWav.name}`) : null;
      const coverRef = coverArt ? ref(storage, `${storagePath}/${coverArt.name}`) : null;
      const musicRefTaggedMp3 = processedAudioFile ? ref(storage, `${storagePath}/${processedAudioFile.name}`) : null;
      const zipRef = zipFile ? ref(storage, `${storagePath}/${zipFile.name}`) : null;

      const uploadTasks = [
        musicRefMp3 && uploadBytesResumable(musicRefMp3, audioFileMp3),
        musicRefWav && uploadBytesResumable(musicRefWav, audioFileWav),
        coverRef && uploadBytesResumable(coverRef, coverArt),
        zipRef && uploadBytesResumable(zipRef, zipFile),
        musicRefTaggedMp3 && uploadBytesResumable(musicRefTaggedMp3, processedAudioFile),
      ].filter(Boolean);

      uploadTasks.forEach((task) => {
        task.on("state_changed", (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 33);
        });
      });

      await Promise.all(uploadTasks);

      const musicUrlMp3 = musicRefMp3 ? await getDownloadURL(musicRefMp3) : "";
      const musicUrlWav = musicRefWav ? await getDownloadURL(musicRefWav) : "";
      const coverUrl = coverRef ? await getDownloadURL(coverRef) : "";
      const zipUrl = zipRef ? await getDownloadURL(zipRef) : "";
      const musicUrlTaggedMp3 = musicRefTaggedMp3 ? await getDownloadURL(musicRefTaggedMp3) : "";

      // Consolidate all data
      const consolidatedData = {
        title: musicTitle,
        musicUrls: { mp3: musicUrlMp3, wav: musicUrlWav, zip: zipUrl, taggedMp3: musicUrlTaggedMp3 },
        coverUrl,
        metadata,
        monetization,
        status: true,
        uploadedBy: email,
        timestamp: Timestamp.now(),
      };

      // Upload consolidated data to Firestore
      await setDoc(newDocRef, consolidatedData);

      setUploadProgress(100);

      alert("🎉 Track Published Successfully!");
    } catch (error) {
      console.error("Error during upload:", error);
      setErrorMessage(error.message || "Upload failed. Please try again.");
    }
  };

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
      setLockedTabs({ tab2: false, tab3: false });
      alert("Record deleted successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record.");
    }
  };

  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleLoadAnother = () => {
    setShowPopup(false);
    window.location.reload();
  };

  const handleGoToUploadedBeats = () => {
    navigate('/UploadedBeatListComponent');
  };

  return (
    <div className="tab-container">
      <GroupA2 />
      <div className="goBack-btn">
        <button onClick={handleBack} className="ViewEditSellBeatPage-goBack">
          <IoReturnUpBackSharp /> Go Back
        </button>
      </div>

      <div className="tab-buttons">
        <button className={activeTab === "tab1" ? "active" : ""} onClick={() => handleNext("tab1")}>
          Files & Basic Info →
        </button>
        <button className={activeTab === "tab2" ? "active" : ""} onClick={() => handleNext("tab2")}>
          Metadata →
        </button>
        <button className={activeTab === "tab3" ? "active" : ""} onClick={() => handleNext("tab3")}>
          Monetization
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "tab1" && (
          <UploadMusicComponent
            selectedMusic={selectedMusic}
            setSelectedMusic={setSelectedMusic}
            handleInputChange={handleInputChange}
            handleFileSelect={handleFileSelect} // Pass handleFileSelect to UploadMusicComponent
          />
        )}
        {activeTab === "tab2" && <Metadata metadata={metadata} setMetadata={setMetadata} />}
        {activeTab === "tab3" && <Monetization monetization={monetization} setMonetization={setMonetization} />}
      </div>

      <div className="button-container">
        {activeTab !== "tab3" && <button className="next-button" onClick={() => handleNext(activeTab === "tab1" ? "tab2" : "tab3")}>Next</button>}
        {activeTab === "tab3" && (
          <>
            <button className="publish-button" onClick={handleUpload}>Publish Track</button>
            <button className="delete-button" onClick={handleDelete}>Delete Record And Start Over</button>
          </>
        )}
      </div>

      {showPopup && (
        <Popup onClose={handlePopupClose}>
          <div className="popup-content">
            <h2>{uploadProgress === 100 ? "Hurray🎉 your track is now live!" : errorMessage ? "Error" : "Uploading..."}</h2>
            {errorMessage ? (
              <p>{errorMessage}</p>
            ) : (
              <div className="progress-bar">
                <div style={{ width: `${uploadProgress}%` }}>{Math.round(uploadProgress)}%</div>
              </div>
            )}
            {uploadProgress === 100 && !errorMessage && (
              <div className="popup-actions">
                <button onClick={handleLoadAnother}>Load Another</button>
                <button onClick={handleGoToUploadedBeats}>Go to Uploaded Beats</button>
              </div>
            )}
          </div>
        </Popup>
      )}
     
        <AudioTagger 
          onProcessedAudio={handleProcessedAudio} 
          uploadedFile={audioFileMp3} 
          hideUI={true} 
        /> 
      
    </div>
  );
};

export default TabPage;