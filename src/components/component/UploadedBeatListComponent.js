import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Modal from 'react-modal'; // Import Modal for pop-up
import './UploadedBeatListComponent.css'; // Import CSS for styling
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO

const UploadedBeatListComponent = ({ setSelectedMusic }) => {
  const [uploadedMusic, setUploadedMusic] = useState([]);
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        fetchMusic(user.uid); // Pass the UID instead of email
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
        .filter((music) => music.userId === userId); // Filter by the logged-in user's UID

      setUploadedMusic(musicList);
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "beats", musicToDelete));
      alert("Music deleted successfully.");
      fetchMusic(email); // Refresh music list
      setIsModalOpen(false); // Close the modal
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
      fetchMusic(email); // Refresh list to reflect new status
    } catch (error) {
      console.error("Error publishing music:", error);
    }
  };

  const handleUnpublish = async (musicItem) => {
    try {
      const musicRef = doc(db, "beats", musicItem.id);

      await updateDoc(musicRef, { status: false });

      alert("Music unpublished successfully.");
      fetchMusic(email); // Refresh list to reflect new status
    } catch (error) {
      console.error("Error unpublishing music:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Uploaded Beats | Ur Beathub</title>
      </Helmet>
      <div className="UploadedBeatList-body">
        <h1 className="UploadedBeatList-title">Uploaded Tracks</h1>
      <ul>
        {uploadedMusic.map((item) => (
          <li key={item.id} className="UploadedBeatList-li">
            <span className="UploadedBeatList-span">
              <span className="UploadedBeatList-img">
                {item.coverUrl && (
                  <img 
                    src={item.coverUrl}
                    alt="Cover Art"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
              </span>
          
              <span>
                <h3 className="UploadedBeatList-beatTitle">{item.title}</h3>
                <audio controls src={item.musicUrls.mp3} className="UploadedBeatList-audio">
                  Your browser does not support the audio element.
                </audio>
              </span>
            </span>
          
            {/* Status Indicator */}
            <span 
              className="status-indicator" 
              style={{
                backgroundColor: item.status ? "green" : "red",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontWeight: "bold",
                display: "inline-block",
                marginTop: "10px",
                fontSize: "small",
              }}
            >
              {item.status ? "Your Beat is Live" : "Your Beat is Private"}
            </span>
          
            <div>
              <Link to="/ViewEditSellBeatPage" state={{ item }}>
                <button className="UploadedBeatList-btn">👁️View and Edit</button>
              </Link>
              
              <button onClick={() => openModal(item.id)} className="UploadedBeatList-btn1">❌Delete</button>
              
              {item.status !== true ? (
                <button onClick={() => handlePublish(item)} className="UploadedBeatList-btn2">✅Publish</button>
              ) : (
                <button onClick={() => handleUnpublish(item)} className="UploadedBeatList-btn3">🔒Unpublish</button>
              )}
            </div>
          </li>
        ))}
      </ul>

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
          <button onClick={handleDelete} className="modal-btn modal-btn-confirm">Yes, Delete</button>
          <button onClick={closeModal} className="modal-btn modal-btn-cancel">Cancel</button>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default UploadedBeatListComponent;
