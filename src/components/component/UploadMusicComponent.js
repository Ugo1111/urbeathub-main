import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase"; // Make sure you have the correct import for db and storage
import { collection, addDoc, doc, updateDoc, getDoc, Timestamp } from "firebase/firestore"; // Import Firestore functions
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UploadMusicComponent = ({ selectedMusic, clearSelection }) => {
  // State hooks
  const [musicFile, setMusicFile] = useState(null);
  const [coverArt, setCoverArt] = useState(null);
  const [musicTitle, setMusicTitle] = useState(""); // Declare music title state
  const [email, setEmail] = useState(""); // Declare email state
  const [isEditMode, setIsEditMode] = useState(false); // Declare edit mode state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email); // Set email when user is logged in
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMusic) {
      setMusicTitle(selectedMusic.title); // Set music title if editing
      setIsEditMode(true); // Set edit mode to true
    } else {
      setIsEditMode(false); // Set edit mode to false if no selected music
    }
  }, [selectedMusic]);

  const handleMusicChange = (e) => {
    setMusicFile(e.target.files[0]); // Set the selected music file
  };

  const handleCoverArtChange = (e) => {
    setCoverArt(e.target.files[0]); // Set the selected cover art file
  };

  const uploadOrUpdateMusic = async () => {
    if (!musicTitle) {
      alert("Please provide a music title.");
      return;
    }

    if (!email) {
      alert("Email is not available. Please ensure you are logged in.");
      return;
    }

    try {
      const updatedData = { title: musicTitle };

      if (isEditMode && selectedMusic) {
        const musicDocRef = doc(db, "musicUploads", email, "music", selectedMusic.id);

        if (musicFile) {
          const musicRef = ref(storage, `music/${email}/${musicFile.name}`);
          await uploadBytesResumable(musicRef, musicFile);
          updatedData.musicUrl = await getDownloadURL(musicRef);
        }

        if (coverArt) {
          const coverRef = ref(storage, `cover-art/${email}/${coverArt.name}`);
          await uploadBytesResumable(coverRef, coverArt);
          updatedData.coverUrl = await getDownloadURL(coverRef);
        }

        // Update the "music" collection
        await updateDoc(musicDocRef, updatedData);
        alert("Music updated successfully!");

        // Check and update "published_music" if it exists
        const publishedMusicDocRef = doc(db, "musicUploads", email, "published_music", selectedMusic.id);
        const publishedDocSnap = await getDoc(publishedMusicDocRef);

        if (publishedDocSnap.exists()) {
          await updateDoc(publishedMusicDocRef, updatedData);
          alert("Published music updated successfully!");
        }
      } else {
        // Upload new music logic
        const musicRef = ref(storage, `music/${email}/${musicFile.name}`);
        const coverRef = ref(storage, `cover-art/${email}/${coverArt.name}`);

        await Promise.all([
          uploadBytesResumable(musicRef, musicFile),
          uploadBytesResumable(coverRef, coverArt),
        ]);

        const musicUrl = await getDownloadURL(musicRef);
        const coverUrl = await getDownloadURL(coverRef);

        const musicCollectionRef = collection(db, "beats");
        await addDoc(musicCollectionRef, {
          title: musicTitle,
          musicUrl,
          coverUrl,
          status: false,
          uploadedBy: email,
          timestamp: Timestamp.now(),
        });

        alert("Music uploaded successfully!");
      }

      setMusicTitle("");
      setMusicFile(null);
      setCoverArt(null);
      clearSelection();
    } catch (error) {
      console.error("Error uploading or updating files:", error);
      alert("Failed to upload or update files.");
    }
  };

  return (
    <div>
      <h1>{isEditMode ? "Edit Music" : "Upload Music"}</h1>
      <input
        type="text"
        placeholder="Music Title"
        value={musicTitle}
        onChange={(e) => setMusicTitle(e.target.value)}
      />
      <input type="file" accept="audio/*" onChange={handleMusicChange} />
      <input type="file" accept="image/*" onChange={handleCoverArtChange} />
      <button onClick={uploadOrUpdateMusic}>
        {isEditMode ? "Update Music" : "Upload Music"}
      </button>
    </div>
  );
};

export default UploadMusicComponent;