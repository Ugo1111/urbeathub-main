import React, { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, updateDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import AudioTagger from "./PageOne"; // Import AudioTagger component
import Metadata from "../component/metaDataUpload"; // Import Metadata component
import Monetization from "../component/Monetization"; // Import Monetization component

const AdminUploadMusicPage = () => {
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
  const [delay, setDelay] = useState("false"); // default as string

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

    return () => unsubscribe();
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
      alert("Please provide a music title.");
      return;
    }
    if (!email) {
      alert("Please ensure you are logged in.");
      return;
    }
    if (!audioFileMp3 || !audioFileWav) {
      alert("Both MP3 and WAV files must be uploaded.");
      return;
    }
    if (!processedAudioFile) {
      alert("Please process the audio file with watermark.");
      return;
    }
    if (!metadata) {
      alert("Please provide metadata.");
      return;
    }
    if (!monetization) {
      alert("Please provide monetization details.");
      return;
    }

    try {
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
        delay: delay === "true", // ✅ Convert string to boolean
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

      alert("Music uploaded successfully!");

      setMusicTitle("");
      setAudioFileMp3(null);
      setAudioFileWav(null);
      setCoverArt(null);
      setCoverPreview(null);
      setZipFile(null); // Reset ZIP file state
      setSelectedMusic(null);
      setProgress(0); // Reset progress bar
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Make sure you have all required files uploaded.");
    }
  }, [musicTitle, email, audioFileMp3, audioFileWav, coverArt, processedAudioFile, zipFile, metadata, monetization, db, storage, username, uid]);

  useEffect(() => {
    setUploadMusic(() => uploadMusic);
  }, [uploadMusic]);

  return (
    <form className="uploadMusicContainer">

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
          <input type="text" placeholder="Enter the Beat Title" maxLength="400" value={musicTitle} onChange={(e) => setMusicTitle(e.target.value)} required />
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

      <div>advanced options</div>
      <label htmlFor="delay">Delivery Option</label>
  <select
    id="delay"
    value={delay}
    onChange={(e) => setDelay(e.target.value)}
  >
    <option value="false">Immediate Delivery</option>
    <option value="true">Delayed Delivery</option>
  </select>
      <button type="button" onClick={uploadMusic} className="upload-button">Upload Music</button> {/* Add upload button */}
    </form>
  );
};
export default AdminUploadMusicPage;