import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import GroupA from "../component/header.js";
import LikeButton from "../component/LikeButton";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { FaPlay, FaPause } from "react-icons/fa"; // Import Icons
import "../css/checkout.css";
import djImage from '../../images/dj.jpg';
import { Helmet } from "react-helmet-async";
import { createSlug } from "../utils/slugify";



function FavouritePage() {
  const [likedSongs, setLikedSongs] = useState(() => {
    const storedLikes = localStorage.getItem("likedSongs");
    return storedLikes ? JSON.parse(storedLikes) : [];
  });

  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [audio, setAudio] = useState(null);

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

          const likeRef = collection(db, `beats/${songId}/likes`);
          const q = query(likeRef, where("userId", "==", user.uid));
          const likeSnap = await getDocs(q);

          if (!likeSnap.empty) {
            userLikedSongs.push({ id: songId, ...songData });
          }
        }

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

  const handlePlayPause = (songUrl, index) => {
    if (playingIndex === index) {
      // If the song is already playing, pause it
      if (audio) {
        audio.pause();
      }
      setPlayingIndex(null);
    } else {
      // Stop previous song if playing
      if (audio) {
        audio.pause();
      }

      // Play new song
      const newAudio = new Audio(songUrl);
      newAudio.play();
      setAudio(newAudio);
      setPlayingIndex(index);

      // Reset when song ends
      newAudio.onended = () => {
        setPlayingIndex(null);
      };
    }
  };

  return (
    <>
    <Helmet>
    <title>Favourite Page</title>
  </Helmet>
    <div className="favourite-page">
      <GroupA />
      <h1>Favourite Tracks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : likedSongs.length === 0 ? (
        <p>You haven't liked any tracks yet.</p>
      ) : (
        <ol className="Ol4favouriteList">
          {likedSongs.map((song, index) => (
            <li
              key={song.id}
              className="favouriteList"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="favioriteSection1">
                {/* Show only ONE element at a time */}
                {playingIndex === index ? (
                  <button className="playButton" onClick={() => handlePlayPause(song.audioUrl, index)}>
                    <FaPause />
                  </button>
                ) : hoveredIndex === index ? (
                  <button className="playButton" onClick={() => handlePlayPause(song.audioUrl, index)}>
                    <FaPlay />
                  </button>
                ) : (
                  <span className="customNumber">{index + 1}.</span>
                )}

                <img 
                  src={song.coverUrl || djImage} 
                  className="listimage" 
                  alt={song.title || "Untitled"} 
                />
                {song.title || "Unknown Title"}
              </div>

              <div className="favioriteSection2">
                <LikeButton  size="1em" songId={song.id} />
                <Link to={`/addToCart/${createSlug(song.title, song.id)}`} state={{ song }}>
                  <button className="FaCartShopping"><FaCartShopping /> Add To Cart</button>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
    </>
  );
}

export default FavouritePage;