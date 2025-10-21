import React, { useState, useEffect, useCallback } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  db,
  storage
} from "../../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import AudioTagger from "../pages/PageOne";
import Metadata from "./metaDataUpload";
import Monetization from "./Monetization";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../css/track.css";

import { Helmet } from "react-helmet-async";

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
  const [username, setUsername] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState(""); // ETA display
  const [zipFile, setZipFile] = useState(null);

  const [audioFileMp3Size, setAudioFileMp3Size] = useState("");
  const [audioFileWavSize, setAudioFileWavSize] = useState("");
  const [zipFileSize, setZipFileSize] = useState("");

  const [processedAudioFile, setProcessedAudioFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
        setUid(user.uid);
        try {
          const userDocRef = doc(db, "beatHubUsers", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || "");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMusic) {
      setMusicTitle(selectedMusic.title);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [selectedMusic]);

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === "musicMp3" && file.type === "audio/mpeg") {
      setAudioFileMp3(file);
      setAudioFileMp3Size(`${(file.size / 1024).toFixed(2)} KB`);
    } else if (fileType === "musicWav" && file.type.includes("wav")) {
      setAudioFileWav(file);
      setAudioFileWavSize(`${(file.size / 1024).toFixed(2)} KB`);
    } else if (fileType === "cover" && file.type.startsWith("image/")) {
      setCoverArt(file);
      setCoverPreview(URL.createObjectURL(file));
    } else if (fileType === "archive") {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["zip"].includes(ext)) {
        alert("Invalid file type. Please upload ZIP only.");
        return;
      }
      setZipFile(file);
      setZipFileSize(`${(file.size / 1024).toFixed(2)} KB`);
    } else {
      alert("Unsupported file type.");
    }
  };

  const handleProcessedAudio = (audioFile) => {
    setProcessedAudioFile(audioFile);
  };

  /** Upload a single file and return download URL */
  const uploadFileAndGetUrl = (file, path, label) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");

      const storageRef = ref(storage, `${path}/${file.name}`);
      const task = uploadBytesResumable(storageRef, file);

      const startTime = Date.now();

      task.on(
        "state_changed",
        (snap) => {
          const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
          setProgress(Math.round(percent));

          // ETA calculation
          const elapsed = Date.now() - startTime; // ms
          const speed = snap.bytesTransferred / (elapsed / 1000); // bytes/sec
          const remainingBytes = snap.totalBytes - snap.bytesTransferred;
          const remainingSec = remainingBytes / speed;

          setProgressText(
            `${label}: ${Math.round(percent)}% - ~${Math.round(remainingSec)}s left`
          );
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const uploadMusic = useCallback(async () => {
    if (
      !musicTitle ||
      !email ||
      !audioFileMp3 ||
      !audioFileWav ||
      !processedAudioFile ||
      !metadata ||
      !monetization
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setIsModalOpen(true);
      setIsUploadComplete(false);

      const musicCollectionRef = collection(db, "beats");
      const newDocRef = await addDoc(musicCollectionRef, {
        title: musicTitle,
        musicUrls: {},
        coverUrl: "",
        zipUrl: "",
        status: true,
        uploadedBy: email,
        username,
        userId: uid,
        timestamp: Timestamp.now(),
        metadata,
        monetization
      });

      setBeatId(newDocRef.id);
      const path = `beats/${newDocRef.id}`;

      // Upload sequentially
      const mp3 = await uploadFileAndGetUrl(audioFileMp3, path, "MP3");
      const wav = await uploadFileAndGetUrl(audioFileWav, path, "WAV");
      const tagged = await uploadFileAndGetUrl(processedAudioFile, path, "Tagged MP3");
      const cover = await uploadFileAndGetUrl(coverArt, path, "Cover Art");
      const zip = await uploadFileAndGetUrl(zipFile, path, "ZIP");

      await updateDoc(newDocRef, {
        musicUrls: { mp3, wav, taggedMp3: tagged, zipUrl: zip },
        coverUrl: cover
      });

      setIsUploadComplete(true);
      setProgress(0);
      setProgressText("");
      setMusicTitle("");
      setAudioFileMp3(null);
      setAudioFileWav(null);
      setCoverArt(null);
      setCoverPreview(null);
      setZipFile(null);
      setSelectedMusic(null);

      toast.success("🎉 Upload complete!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error.message);
      setIsModalOpen(false);
    }
  }, [
    musicTitle,
    email,
    audioFileMp3,
    audioFileWav,
    coverArt,
    processedAudioFile,
    zipFile,
    metadata,
    monetization,
    db,
    storage,
    username,
    uid
  ]);

  useEffect(() => {
    setUploadMusic(() => uploadMusic);
  }, [uploadMusic]);

  return (
    <>
      <Helmet>
        <title>Upload Track Page</title>
      </Helmet>
      <form className="upload-form">
        <h1>Upload a Track</h1>

        <section className="upload-section">
          <div className="cover-upload">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="cover-preview"
              />
            ) : (
              <p>🌆 Upload Cover Art</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "cover")}
            />
          </div>

          <div className="title-input">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter Beat Title"
              value={musicTitle || ""}
              onChange={(e) => setMusicTitle(e.target.value)}
            />
          </div>
        </section>

        <div className="upload-input">
          <p>
            {audioFileMp3
              ? `🎵 ${audioFileMp3.name} (${audioFileMp3Size})`
              : "Upload MP3 File"}
          </p>
          <input
            type="file"
            accept="audio/mpeg"
            onChange={(e) => handleFileSelect(e, "musicMp3")}
          />
        </div>

        <div className="upload-input">
          <p>
            {audioFileWav
              ? `🎵 ${audioFileWav.name} (${audioFileWavSize})`
              : "Upload WAV File"}
          </p>
          <input
            type="file"
            accept="audio/wav"
            onChange={(e) => handleFileSelect(e, "musicWav")}
          />
        </div>

        <div className="upload-input">
          <p>
            {zipFile ? `📦 ${zipFile.name} (${zipFileSize})` : "Upload ZIP File"}
          </p>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => handleFileSelect(e, "archive")}
          />
        </div>

        <AudioTagger
          onProcessedAudio={handleProcessedAudio}
          uploadedFile={audioFileMp3}
          hideUI={true}
        />

        {progress > 0 && (
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }}>{progressText}</div>
          </div>
        )}

        <Metadata metadata={metadata} setMetadata={setMetadata} />
        <Monetization monetization={monetization} setMonetization={setMonetization} />
        <div className="center-wrapper">
          <button
            type="button"
            onClick={uploadMusic}
            className="upload-button"
          >
            Upload Beat
          </button>
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        {!isUploadComplete ? (
          <>
            <h2>Uploading...</h2>
            <div className="progress-bar">
              <div style={{ width: `${progress}%` }}>{progressText}</div>
            </div>
          </>
        ) : (
          <>
            <h2>🎉 Your track is now live! 🎉</h2>
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>
                Upload Another
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default UsersUploadMusicPage;
