import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import GroupA from "../component/header.js";
import LikeButton from "../component/LikeButton.js";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import "../css/checkout.css";

function Purchased() {
  const [likedSongs, setLikedSongs] = useState(() => {
    // Load from localStorage on initial render
    const storedLikes = localStorage.getItem("likedSongs");
    return storedLikes ? JSON.parse(storedLikes) : [];
  });

  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let userLikedSongs = [];
        const beatsRef = collection(db, "beats");
        const beatsSnapshot = await getDocs(beatsRef);

        for (const songDoc of beatsSnapshot.docs) {
          const songId = songDoc.id;
          const songData = songDoc.data();

          // Check if the user has liked this song
          const likeRef = collection(db, `beats/${songId}/likes`);
          const q = query(likeRef, where("userId", "==", user.uid));
          const likeSnap = await getDocs(q);

          if (!likeSnap.empty) {
            userLikedSongs.push({ id: songId, ...songData });
          }
        }

        // Save to localStorage
        localStorage.setItem("likedSongs", JSON.stringify(userLikedSongs));

        setLikedSongs(userLikedSongs);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  return (
    <div className="favourite-page">
      <GroupA />
      <h1>Purchased Tracks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : likedSongs.length === 0 ? (
        <p>You haven't Purchased any tracks yet.</p>
      ) : (



       <ol className="Ol4favouriteList">
  {likedSongs.map((song, index) => (
    <li key={song.id} className="favouriteList">
      <div className="favioriteSection1">
        <span className="customNumber">{index + 1}.</span> {/* Custom Numbering */}
        <img 
          src={song.coverUrl || "./images/default-cover.jpg"} 
          className="listimage" 
          alt={song.title || "Untitled"} 
        />
        {song.title || "Unknown Title"}
      </div>
      <div className="favioriteSection2">
        <LikeButton size="1.5em" songId={song.id} />
        <Link to="/buysong" state={{ song }}>
          <button className="FaCartShopping"><FaCartShopping /> Add To Cart</button>
        </Link>
      </div>
    </li>
  ))}
</ol>
      )
      }
    </div>
  );
}

export default Purchased;