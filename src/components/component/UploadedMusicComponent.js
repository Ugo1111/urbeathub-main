import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { 
  collection, getDocs, deleteDoc, doc, setDoc, getDoc 
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UploadedMusicComponent = ({ setSelectedMusic }) => {
  const [uploadedMusic, setUploadedMusic] = useState([]);
  const [publishedStatus, setPublishedStatus] = useState({});
  const [email, setEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        fetchMusic(user.email);
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMusic = async (userEmail) => {
    try {
      const musicCollectionRef = collection(db, "musicUploads", userEmail, "music");
      const querySnapshot = await getDocs(musicCollectionRef);
      const musicList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUploadedMusic(musicList);

      // Check published status for each music item
      const statusMap = {};
      for (const music of musicList) {
        const publishedDocRef = doc(db, "musicUploads", userEmail, "published_music", music.id);
        const publishedDocSnap = await getDoc(publishedDocRef);
        statusMap[music.id] = publishedDocSnap.exists();
      }
      setPublishedStatus(statusMap);
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  const handleDelete = async (id, isPublished) => {
    try {
      if (isPublished === undefined) {
        alert("Error: Published status is undefined.");
        return;
      }

      if (!isPublished) {
        await deleteDoc(doc(db, "musicUploads", email, "music", id));
      }

      if (isPublished) {
        await deleteDoc(doc(db, "musicUploads", email, "music", id));
        await deleteDoc(doc(db, "musicUploads", email, "published_music", id));
      }

      alert("Music deleted successfully.");
      fetchMusic(email); // Refresh music list
    } catch (error) {
      console.error("Error deleting music:", error);
    }
  };

  const handlePublish = async (musicItem) => {
    try {
      const publishedMusicRef = doc(db, "musicUploads", email, "published_music", musicItem.id);
      await setDoc(publishedMusicRef, musicItem);
      alert("Music published successfully.");
      fetchMusic(email); // Update published status
    } catch (error) {
      console.error("Error publishing music:", error);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await deleteDoc(doc(db, "musicUploads", email, "published_music", id));
      alert("Music unpublished successfully.");
      fetchMusic(email); // Update published status
    } catch (error) {
      console.error("Error unpublishing music:", error);
    }
  };

  return (
    <div>
      <h2>Uploaded Music</h2>
      <ul>
        {uploadedMusic.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <audio controls src={item.musicUrl}>
              Your browser does not support the audio element.
            </audio>
            <br />
            {item.coverUrl && (
              <img
                src={item.coverUrl}
                alt="Cover Art"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            <br />
            <button onClick={() => setSelectedMusic(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id, publishedStatus[item.id])}>Delete</button>
            {!publishedStatus[item.id] ? (
              <button onClick={() => handlePublish(item)}>Publish</button>
            ) : (
              <button onClick={() => handleUnpublish(item.id)}>Unpublish</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadedMusicComponent;