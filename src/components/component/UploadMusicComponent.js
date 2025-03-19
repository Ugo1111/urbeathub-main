import React, { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { collection, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMusicUploadContext } from "../context/MusicUploadProvider";

const UploadMusicComponent = () => {
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

    try {
      const musicCollectionRef = collection(db, "beats");
      const newDocRef = await addDoc(musicCollectionRef, {
        title: musicTitle,
        musicUrls: {},
        coverUrl: "",
        status: false,
        uploadedBy: email,
        timestamp: Timestamp.now(),
      });

      setBeatId(newDocRef.id);

      const storagePath = `beats/${newDocRef.id}`;
      const musicRefMp3 = audioFileMp3 ? ref(storage, `${storagePath}/${audioFileMp3.name}`) : null;
      const musicRefWav = audioFileWav ? ref(storage, `${storagePath}/${audioFileWav.name}`) : null;
      const coverRef = coverArt ? ref(storage, `${storagePath}/${coverArt.name}`) : null;

      const uploadTasks = [
        musicRefMp3 && uploadBytesResumable(musicRefMp3, audioFileMp3),
        musicRefWav && uploadBytesResumable(musicRefWav, audioFileWav),
        coverRef && uploadBytesResumable(coverRef, coverArt),
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

      await updateDoc(newDocRef, {
        musicUrls: { mp3: musicUrlMp3, wav: musicUrlWav },
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
  }, [musicTitle, email, audioFileMp3, audioFileWav, coverArt, db, storage]);

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

      {/* <button onClick={uploadMusic}>{isEditMode ? "Update Music" : "Upload Music"}</button> */}

      {progress > 0 && <div className="progress-bar"><div style={{ width: `${progress}%` }}>{Math.round(progress)}%</div></div>}
    </form>
  );
};

export default UploadMusicComponent;