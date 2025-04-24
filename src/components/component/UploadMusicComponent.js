import React, { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import AudioTagger from "../pages/PageOne"; // Import AudioTagger component

const UploadMusicComponent = ({ handleInputChange, handleFileSelect }) => {
  const {
    setUploadMusic,
    audioFileMp3, setAudioFileMp3,
    audioFileWav, setAudioFileWav,
    coverArt, setCoverArt,
    musicTitle, setMusicTitle,
    selectedMusic, setSelectedMusic,
    beatId, setBeatId,
    coverPreview, setCoverPreview
  } = useMusicUploadContext();

  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipFile, setZipFile] = useState(null);
  const [audioFileSize, setAudioFileSize] = useState("");
  const [processedAudioFile, setProcessedAudioFile] = useState(null); // State to store processed audio file

  // Fetch logged-in user info
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        setUid(user.uid);
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
  }, [selectedMusic, setMusicTitle]);

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

    try {
      const musicCollectionRef = collection(db, "beats");
      const userDocRef = collection(db, "users");
      const userSnapshot = await getAuth().currentUser;
      const userQuery = await userDocRef.where("uid", "==", userSnapshot.uid).get();

      let username = email; // Default to email if username is not found
      if (!userQuery.empty) {
        const userData = userQuery.docs[0].data();
        username = userData.username || "";
      }

      const newDocRef = await addDoc(musicCollectionRef, {
        title: musicTitle,
        musicUrls: {},
        coverUrl: "",
        status: true,
        uploadedBy: username,
        timestamp: Timestamp.now(),
      });

      setBeatId(newDocRef.id);

      const storagePath = `beats/${newDocRef.id}`;
      const musicRefMp3 = audioFileMp3 ? ref(storage, `${storagePath}/${audioFileMp3.name}`) : null;
      const musicRefWav = audioFileWav ? ref(storage, `${storagePath}/${audioFileWav.name}`) : null;
      const coverRef = coverArt ? ref(storage, `${storagePath}/${coverArt.name}`) : null;
      const musicRefTaggedMp3 = processedAudioFile ? ref(storage, `${storagePath}/${processedAudioFile.name}`) : null;

      const uploadTasks = [
        musicRefMp3 && uploadBytesResumable(musicRefMp3, audioFileMp3),
        musicRefWav && uploadBytesResumable(musicRefWav, audioFileWav),
        coverRef && uploadBytesResumable(coverRef, coverArt),
        musicRefTaggedMp3 && uploadBytesResumable(musicRefTaggedMp3, processedAudioFile),
      ].filter(Boolean);

      uploadTasks.forEach((task) => {
        task.on("state_changed", (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        });
      });

      await Promise.all(uploadTasks);

      const musicUrlMp3 = musicRefMp3 ? await getDownloadURL(musicRefMp3) : "";
      const musicUrlWav = musicRefWav ? await getDownloadURL(musicRefWav) : "";
      const coverUrl = coverRef ? await getDownloadURL(coverRef) : "";
      const musicUrlTaggedMp3 = musicRefTaggedMp3 ? await getDownloadURL(musicRefTaggedMp3) : "";

      await updateDoc(newDocRef, {
        musicUrls: { mp3: musicUrlMp3, wav: musicUrlWav, taggedMp3: musicUrlTaggedMp3 },
        coverUrl,
      });

      alert("Music uploaded successfully!");

      setMusicTitle("");
      setAudioFileMp3(null);
      setAudioFileWav(null);
      setCoverArt(null);
      setCoverPreview(null);
      setSelectedMusic(null);
      setProgress(0);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Make sure you have both MP3 and WAV uploaded.");
    }
  }, [musicTitle, email, audioFileMp3, audioFileWav, coverArt, processedAudioFile, db, storage]);

  useEffect(() => {
    setUploadMusic(() => uploadMusic);
  }, [uploadMusic]);

  return (
    <form className="uploadMusicContainer">
      <div className="cover-title">
        <div className="drop-zone4Image" style={{ width: "200px", height: "200px" }}> {/* Set fixed dimensions for the box */}
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
            maxLength="400"
            value={selectedMusic.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
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
    </form>
    
  );
};

export default UploadMusicComponent;