import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import djImage from '../../images/dj.jpg';
import "../css/recomendationComponent.css"; // Import CSS for skeleton styles

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
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchSongs = async () => {
      const docRef = collection(db, "beats");
      const querySnapshot = await getDocs(docRef);
      const songsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch likes for each song
      const songsWithLikes = await Promise.all(
        songsList.map(async (song) => {
          const likesRef = collection(db, `beats/${song.id}/likes`);
          const likesSnapshot = await getDocs(likesRef);
          return { ...song, likes: likesSnapshot.size };
        })
      );

      // Sort songs by likes in descending order and then shuffle
      const sortedSongs = songsWithLikes.sort((a, b) => b.likes - a.likes);
      const shuffledSongs = shuffleArray(sortedSongs);

      // Limit to 7 songs
      setSongs(shuffledSongs.slice(0, 12));
      setLoading(false); // Set loading to false after fetching
    };

    fetchSongs();
  }, []);


  const handleLinkClick = () => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div className="recomendation-list-container">
      {loading ? (
        // Skeleton UI while loading
        Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="recomendation-list skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-tag"></div>
          </span>
        ))
            ) : (
        songs.slice(0, 7).map((song, index) => (
          <span key={index} className="recomendation-list">
            <Link to="/addToCart" state={{ song }} className="recomendation-" onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>
              <img
                src={song.coverUrl || djImage}
                className="recomendation-image"
                alt={song.title || "Untitled"}
              />
              <div className="recomendation-title">{song.title}</div>
              <div className="recomendation-tag">
                <button className="recomendation-AddToCart-button">
                  <FaCartShopping size="1em" /> ${song.monetization?.basic?.price}
                </button>
              </div>
            </Link>
          </span>
        ))
      )}
    </div>
  );
}
