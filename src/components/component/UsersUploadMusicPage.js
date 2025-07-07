import React, { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, updateDoc, Timestamp, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Import Firestore query functions
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import AudioTagger from "../pages/PageOne"; // Import AudioTagger component
import Metadata from "./metaDataUpload"; // Import Metadata component
import Monetization from "./Monetization"; // Import Monetization component
import Modal from "react-modal"; // Import Modal
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";


const UsersUploadMusicPage = () => {
  const {
    setUploadMusic,
    audioFileMp3, setAudioFileMp3,
    audioFileWav, setAudioFileWav,
    coverArt, setCoverArt,
    musicTitle, setMusicTitle,
    selectedMusic, setSelectedMusic,
    beatId, setBeatId,
    coverPreview, setCoverPreview,
    metadata, setMetadata,
    monetization, setMonetization
  } = useMusicUploadContext();

  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [username, setUsername] = useState(""); // State to store username
  const [isEditMode, setIsEditMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipFile, setZipFile] = useState(null);
  const [audioFileSize, setAudioFileSize] = useState("");
  const [processedAudioFile, setProcessedAudioFile] = useState(null); // State to store processed audio file
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isUploadComplete, setIsUploadComplete] = useState(false); // Upload completion state

  const navigate = useNavigate(); // Initialize navigate

  // Fetch logged-in user info and username from Firestore
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
        setUid(user.uid);

        try {
          // Directly fetch the document using the UID
          const userDocRef = doc(db, "beatHubUsers", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || ""); // Set the username if found
          } else {
            console.warn("No user document found in beatHubUsers for the given UID.");
          }
        } catch (error) {
          console.error("Error fetching username from Firestore:", error);
        }
      }
    });

    return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  };
}, []);

  // Set edit mode if a music track is selected
  useEffect(() => {
    if (selectedMusic) {
      setMusicTitle(selectedMusic.title);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [selectedMusic]);

  // Handle file selection
  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === "musicMp3" && file.type === "audio/mpeg") {
      setAudioFileMp3(file);
    } else if (fileType === "musicWav" && (file.type === "audio/wav" || file.type === "audio/x-wav")) {
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

    if (fileType !== "cover") {
      setAudioFileSize(`${(file.size / 1024).toFixed(2)} KB`);
    }
  };

  // Function to handle the processed audio file from AudioTagger
  const handleProcessedAudio = (audioFile) => {
    setProcessedAudioFile(audioFile);
  };

  // Upload music function (memoized with useCallback)
  const uploadMusic = useCallback(async () => {
    if (!musicTitle) {
      toast.error("Please provide a music title.", {
        position: "top-center",
      });
      return;
    }
    if (!email) {
      toast.error("Please ensure you are logged in.", {
        position: "top-center",
      });
      return;
    }
    if (!audioFileMp3 || !audioFileWav) {
      toast.error("Both MP3 and WAV files must be uploaded.", {
        position: "top-center",
      });
      return;
    }
    if (!processedAudioFile) {
      toast.error("Please process the audio file with watermark.", {
        position: "top-center",
      });
      return;
    }
    if (!metadata) {
      toast.error("Please provide metadata.", {
        position: "top-center",
      });
      return;
    }
    if (!monetization) {
      toast.error("Please provide monetization details.", {
        position: "top-center",
      });
      return;
    }

    try {
      setIsModalOpen(true); // Open the modal
      setIsUploadComplete(false); // Reset upload completion state

      const musicCollectionRef = collection(db, "beats");
      const newDocRef = await addDoc(musicCollectionRef, {
        title: musicTitle,
        musicUrls: {},
        coverUrl: "",
        zipUrl: "", // Add a field for the ZIP file URL
        status: true,
        uploadedBy: email,
        username, // Include the fetched username
        userId: uid,
        timestamp: Timestamp.now(),
        metadata, // Include metadata
        monetization, // Include monetization details
      });

      setBeatId(newDocRef.id);

      const storagePath = `beats/${newDocRef.id}`;
      const musicRefMp3 = ref(storage, `${storagePath}/${audioFileMp3.name}`);
      const musicRefWav = ref(storage, `${storagePath}/${audioFileWav.name}`);
      const coverRef = coverArt ? ref(storage, `${storagePath}/${coverArt.name}`) : null;
      const musicRefTaggedMp3 = ref(storage, `${storagePath}/${processedAudioFile.name}`);
      const zipRef = zipFile ? ref(storage, `${storagePath}/${zipFile.name}`) : null;

      const uploadTasks = [
        uploadBytesResumable(musicRefMp3, audioFileMp3),
        uploadBytesResumable(musicRefWav, audioFileWav),
        coverRef && uploadBytesResumable(coverRef, coverArt),
        uploadBytesResumable(musicRefTaggedMp3, processedAudioFile),
        zipRef && uploadBytesResumable(zipRef, zipFile),
      ].filter(Boolean);

      uploadTasks.forEach((task) => {
        task.on("state_changed", (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        });
      });

      await Promise.all(uploadTasks);

      const musicUrlMp3 = await getDownloadURL(musicRefMp3);
      const musicUrlWav = await getDownloadURL(musicRefWav);
      const coverUrl = coverRef ? await getDownloadURL(coverRef) : "";
      const musicUrlTaggedMp3 = await getDownloadURL(musicRefTaggedMp3);
      const zipUrl = zipRef ? await getDownloadURL(zipRef) : "";

      await updateDoc(newDocRef, {
        musicUrls: {
          mp3: musicUrlMp3,
          wav: musicUrlWav,
          taggedMp3: musicUrlTaggedMp3,
          zipUrl: zipUrl || "",
        },
        coverUrl,
      });

      setIsUploadComplete(true); // Mark upload as complete
      setProgress(0); // Reset progress bar

      setMusicTitle("");
      setAudioFileMp3(null);
      setAudioFileWav(null);
      setCoverArt(null);
      setCoverPreview(null);
      setZipFile(null); // Reset ZIP file state
      setSelectedMusic(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Make sure you have all required files uploaded.");
      setIsModalOpen(false); // Close the modal on error
    }
  }, [musicTitle, email, audioFileMp3, audioFileWav, coverArt, processedAudioFile, zipFile, metadata, monetization, db, storage, username, uid]);

  useEffect(() => {
    setUploadMusic(() => uploadMusic);
  }, [uploadMusic]);

  return (
    <>
    <Helmet>
      <title>Upload Track Page</title>
    </Helmet>
    <form className="uploadMusicContainer">
      <h1>Upload A Track</h1>
      <div className="cover-title">
        <div className="drop-zone4Image">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover Art Preview" className="preview-image" />
          ) : (
            <p>🌆Drag & Drop Image Here or Click to Upload🏞️</p>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "cover")} />
        </div>

        <div className="MusicTitle-label">
          <label>Title</label>
         <input
  type="text"
  placeholder="Enter the Beat Title"
  value={musicTitle || ""} // ✅ fallback to empty string
  onChange={(e) => setMusicTitle(e.target.value)}
/>
        </div>
      </div>

      <div className="drop-zone">
        {audioFileMp3 ? <p>🎵 {audioFileMp3.name} ({audioFileSize})</p> : <p>Drag & Drop MP3 Here or Click to Upload🎙️</p>}
        <input type="file" required accept="audio/mpeg" onChange={(e) => handleFileSelect(e, "musicMp3")} />
      </div>

      <div className="drop-zone">
        {audioFileWav ? <p>🎵 {audioFileWav.name} ({audioFileSize})</p> : <p>Drag & Drop WAV Here or Click to Upload🎤</p>}
        <input type="file" required accept="audio/wav" onChange={(e) => handleFileSelect(e, "musicWav")} />
      </div>

      <div className="drop-zone">
        {zipFile ? <p>📦 {zipFile.name}</p> : <p>🗂️Drag & Drop ZIP/RAR Here or Click to Upload📁</p>}
        <input type="file" accept=".zip,.rar" onChange={(e) => handleFileSelect(e, "archive")} />
      </div>

      <AudioTagger onProcessedAudio={handleProcessedAudio} uploadedFile={audioFileMp3} hideUI={true} /> {/* Include AudioTagger component */}

      {progress > 0 && <div className="progress-bar"><div style={{ width: `${progress}%` }}>{Math.round(progress)}%</div></div>}

      <Metadata metadata={metadata} setMetadata={setMetadata} /> {/* Include Metadata component */}
      <Monetization monetization={monetization} setMonetization={setMonetization} /> {/* Include Monetization component */}
      <button type="button" onClick={uploadMusic} className="upload-button">Upload Music</button> {/* Add upload button */}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Upload Progress"
        className="Modal"
        overlayClassName="Overlay"
      >
        {!isUploadComplete ? (
          <>
            <h2>Uploading Your Track...</h2>
            <div className="progress-bar">
              <div style={{ width: `${progress}%` }}>{Math.round(progress)}%</div>
            </div>
          </>
        ) : (
          <>
            <h2>🎉 Hurray your track is now live! 🎊</h2>
            <div className="modal-buttons">
              <button onClick={() => setIsModalOpen(false)} className="modal-btn">Upload Another Track</button>
              {/* <button onClick={() => navigate("/UploadedBeatListComponent")} className="modal-btn">Go to Uploaded Tracks</button> */}
            </div>
          </>
        )}
      </Modal>
    </form>
    </>
  );
};
export default UsersUploadMusicPage;
