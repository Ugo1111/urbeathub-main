import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import "../css/track.css";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Modal from "react-modal";
import { Helmet } from "react-helmet";

const Tracks = ({ setSelectedMusic }) => {
  const [uploadedMusic, setUploadedMusic] = useState([]);
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        fetchMusic(user.uid);
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMusic = async (userId) => {
    try {
      const musicCollectionRef = collection(db, "beats");
      const querySnapshot = await getDocs(musicCollectionRef);
      const musicList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((music) => music.userId === userId);

      setUploadedMusic(musicList);
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "beats", musicToDelete));
      alert("Music deleted successfully.");
      fetchMusic(email);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting music:", error);
    }
  };

  const openModal = (id) => {
    setMusicToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMusicToDelete(null);
  };

  const handlePublish = async (musicItem) => {
    try {
      const musicRef = doc(db, "beats", musicItem.id);
      await updateDoc(musicRef, { status: true });
      alert("Music published successfully.");
      fetchMusic(email);
    } catch (error) {
      console.error("Error publishing music:", error);
    }
  };

  const handleUnpublish = async (musicItem) => {
    try {
      const musicRef = doc(db, "beats", musicItem.id);
      await updateDoc(musicRef, { status: false });
      alert("Music unpublished successfully.");
      fetchMusic(email);
    } catch (error) {
      console.error("Error unpublishing music:", error);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown((prevId) => (prevId === id ? null : id));
  };

  const handlePlayPause = (id) => {
    const currentAudio = audioRefs.current[id];

    if (!currentAudio) return;

    // Pause all other tracks
    Object.keys(audioRefs.current).forEach((key) => {
      if (key !== id && audioRefs.current[key]) {
        audioRefs.current[key].pause();
        audioRefs.current[key].currentTime = 0;
      }
    });

    if (currentlyPlayingId === id) {
      currentAudio.pause();
      setCurrentlyPlayingId(null);
    } else {
      currentAudio.play();
      setCurrentlyPlayingId(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Uploaded Beats | Ur Beathub</title>
      </Helmet>
      <div className="uploaded-beat-grid">
        {uploadedMusic.map((item) => (
          <div key={item.id} className="beat-card">
            <div className="cover-container">
              <img src={item.coverUrl} alt="Cover Art" className="cover-image" />
              <button className="play-button" onClick={() => handlePlayPause(item.id)}>
                {currentlyPlayingId === item.id ? "⏸" : "▶"}
              </button>
              <audio
                ref={(el) => (audioRefs.current[item.id] = el)}
                src={item.musicUrls.mp3}
              />
            </div>

            <div className="beat-info">
             <div className="title-status">
  <h3 className="beat-title" title={item.title}>
    {item.title}
  </h3>
  <span className={`status ${item.status ? "live" : "private"}`}>
    {item.status ? "Your Beat is Live" : "Your Beat is Private"}
  </span>
</div>



              <div className="options-container">
                <button className="options-button" onClick={() => toggleDropdown(item.id)}>
                  ⋮
                </button>
                {activeDropdown === item.id && (
                  <div className="options-dropdown">
                    <Link to="/ViewEditSellBeatPage" state={{ item }}>Edit</Link>
                    <button onClick={() => openModal(item.id)}>Delete</button>
                    {item.status ? (
                      <button onClick={() => handleUnpublish(item)}>Unpublish</button>
                    ) : (
                      <button onClick={() => handlePublish(item)}>Publish</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div> 
        ))}

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Confirm Delete"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete this music?</p>
          <div className="modal-buttons">
            <button onClick={handleDelete} className="modal-btn modal-btn-confirm">
              Yes, Delete
            </button>
            <button onClick={closeModal} className="modal-btn modal-btn-cancel">
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Tracks;
