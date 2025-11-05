import React, { useState, useEffect,useRef } from "react";
import { getFirestore, collection, getDocs, query, where , doc, getDoc} from "firebase/firestore";
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

  const audioRef = useRef(new Audio());

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
        // Step 1: get the user doc
        const userDocRef = doc(db, "beatHubUsers", user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (!userDocSnap.exists()) {
          setLikedSongs([]);
          setLoading(false);
          return;
        }
  
        // Step 2: get likedBeats array
        const likedBeats = userDocSnap.data()?.likedBeats || [];
        if (likedBeats.length === 0) {
          setLikedSongs([]);
          setLoading(false);
          return;
        }
  
        // Step 3: fetch beats by their document IDs
        const likedSongsData = await Promise.all(
          likedBeats.map(async (beatId) => {
            const beatDoc = await getDoc(doc(db, "beats", beatId));
            return beatDoc.exists() ? { id: beatDoc.id, ...beatDoc.data() } : null;
          })
        );
  
        // Remove nulls (deleted beats)
        const validSongs = likedSongsData.filter(Boolean);
  
        // Save locally and update state
        localStorage.setItem("likedSongs", JSON.stringify(validSongs));
        setLikedSongs(validSongs);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
        setLikedSongs([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLikedSongs();
  }, [auth, db]);

  const handlePlayPause = (songUrl, index) => {
    if (!songUrl) {
      console.warn("No audio URL for this song", likedSongs[index]);
      return;
    }
  
    const audio = audioRef.current;
  
    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }
  
    audio.pause();
    audio.src = songUrl;
    audio.load();
    audio.play().catch((error) => console.error("Playback failed:", error));
  
    setPlayingIndex(index);
  
    audio.onended = () => setPlayingIndex(null);
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
                  <button className="playButton" onClick={() => handlePlayPause(song.musicUrls?.taggedMp3, index)}>
                    <FaPause />
                  </button>
                ) : hoveredIndex === index ? (
                  <button className="playButton" onClick={() => handlePlayPause(song.musicUrls?.taggedMp3, index)}>
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