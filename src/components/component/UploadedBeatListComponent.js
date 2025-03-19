import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UploadedBeatListComponent = ({ setSelectedMusic }) => {
  const [uploadedMusic, setUploadedMusic] = useState([]);
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
      const musicCollectionRef = collection(db, "beats");
      const querySnapshot = await getDocs(musicCollectionRef);
      const musicList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUploadedMusic(musicList);
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "musicUploads", email, "music", id));
      alert("Music deleted successfully.");
      fetchMusic(email); // Refresh music list
    } catch (error) {
      console.error("Error deleting music:", error);
    }
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
           {item.status ? " Live" : "Private"}
         </span>
       
         <div>
           <Link to="/ViewEditSellBeatPage" state={{ item }}>
             <button className="UploadedBeatList-btn">View and Edit</button>
           </Link>
           
           <button onClick={() => handleDelete(item.id)} className="UploadedBeatList-btn">Delete</button>
           
           {item.status !== true ? (
             <button onClick={() => handlePublish(item)} className="UploadedBeatList-btn">Publish</button>
           ) : (
             <button onClick={() => handleUnpublish(item)} className="UploadedBeatList-btn">Unpublish</button>
           )}
         </div>
       </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadedBeatListComponent;
