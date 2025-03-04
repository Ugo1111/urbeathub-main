import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";

const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default function RecomendationComponent() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const docRef = collection(db, "beats");
      const querySnapshot = await getDocs(docRef);
      const songsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffledSongs = shuffleArray(songsList);
      setSongs(shuffledSongs);
    };

    fetchSongs();
  }, []);


  const handleLinkClick = () => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div className="recomendation-list-container">
      {songs.map((song, index) => (
        <span key={index} className="recomendation-list">
            <Link to="/buysong" state={{ song }} className="recomendation-" onClick={() => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}>
          <img
            src={song.coverUrl || "./images/default-cover.jpg"}
            className="recomendation-image"
            alt={song.title || "Untitled"}
          />
          <div className="recomendation-title">{song.title}</div>
          <div className="recomendation-tag">
              <button    className="recomendation-AddToCart-button">
                <FaCartShopping size="1em" /> ${song.monetization?.basic?.price}
              </button>
          </div>
            </Link>
        </span>
      ))}
    </div>
  );
}
