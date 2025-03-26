import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { 
  collection, getDocs, deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for relative time formatting
import "../css/uploadedMusicComponent.css";

const UploadedMusicComponent = ({ setSelectedMusic }) => {
  const [uploadedMusic, setUploadedMusic] = useState([]);
  const [email, setEmail] = useState("");
  const [filteredTracks, setFilteredTracks] = useState([]); // Filtered list of tracks
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const navigate = useNavigate();

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
      const musicCollectionRef = collection(db, "beats");
      const querySnapshot = await getDocs(musicCollectionRef);
      const musicList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUploadedMusic(musicList);
      setFilteredTracks(musicList); // Initialize filtered tracks
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  // Filter tracks based on search term
  useEffect(() => {
    const filtered = uploadedMusic.filter((track) =>
      track.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTracks(filtered);
  }, [searchTerm, uploadedMusic]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "beats", id));
      alert("Music deleted successfully.");
      fetchMusic(email); // Refresh music list
    } catch (error) {
      console.error("Error deleting music:", error);
    }
  };

  const handlePublish = async (musicItem) => {
    try {
      const musicRef = doc(db,"beats", musicItem.id);
      
      await updateDoc(musicRef, { status: true });

      alert("Music published successfully.");
      fetchMusic(email); // Refresh list to reflect new status
    } catch (error) {
      console.error("Error publishing music:", error);
    }
  };

  const handleUnpublish = async (musicItem) => {
    try {
      const musicRef = doc(db,"beats", musicItem.id);

      await updateDoc(musicRef, { status: false });

      alert("Music unpublished successfully.");
      fetchMusic(email); // Refresh list to reflect new status
    } catch (error) {
      console.error("Error unpublishing music:", error);
    }
  };

  const handleEdit = (item) => {
    navigate("/EditTrackPage", { state: { item } });
  };

  return (
    <div className="uploaded-music-container">
      <h2>Uploaded Music</h2>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search tracks by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      <ul className="uploaded-music-list">
        {filteredTracks.map((item) => (
          <li key={item.id} className="uploaded-music-item">
            <>
              <h3>{item.title}</h3>
              <div className="media-container">
                {item.coverUrl && (
                  <img
                    src={item.coverUrl}
                    alt="Cover Art"
                    className="cover-art"
                  />
                )}
                <audio controls src={item.musicUrls.mp3}>
                  Your browser does not support the audio element.
                </audio>
              </div>
              <p className="timestamp">
                Uploaded {formatDistanceToNow(new Date(item.timestamp.seconds * 1000), { addSuffix: true })}
              </p>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)} className="delete">Delete</button>
              {item.status !== true ? (
                <button onClick={() => handlePublish(item)} className="publish">Publish</button>
              ) : (
                <button onClick={() => handleUnpublish(item)} className="unpublish">Unpublish</button>
              )}
            </>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadedMusicComponent;