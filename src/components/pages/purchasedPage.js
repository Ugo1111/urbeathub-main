import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import GroupA from "../component/header.js";
import LikeButton from "../component/LikeButton";
import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa"; // Import Icons
import "../css/checkout.css";

function PurchasedTracksPage() {
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

          const likeRef = collection(db, `beats/${songId}/purchases`);
          const q = query(likeRef, where("userId", "==", user.uid));
          const likeSnap = await getDocs(q);

          // Check if the song is purchased by the user
          if (!likeSnap.empty) {
            // Try to get license from the purchase, otherwise fallback to the beat's license
            const license = likeSnap.docs[0]?.data()?.license || songData.license || "No License Information";

            userLikedSongs.push({
              id: songId,
              ...songData,
              audioUrl: songData.musicUrls?.mp3 || null, // Ensure mp3 URL is fetched correctly
              coverUrl: songData.coverUrl || "./images/default-cover.jpg",
              license: license, // Assign the license from purchase or beat data
            });
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

    // Fetch Purchased Tracks (Updated version)
    const fetchPurchasedTracks = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let userPurchasedTracks = [];
        const purchasesRef = collection(db, `beatHubUsers/${user.uid}/purchases`);
        const purchasesSnapshot = await getDocs(purchasesRef);

        for (const purchaseDoc of purchasesSnapshot.docs) {
          const purchaseData = purchaseDoc.data();
          const beatId = purchaseData.beatId;

          // Fetch beat details
          const beatRef = doc(db, "beats", beatId);
          const beatSnap = await getDoc(beatRef);

          if (beatSnap.exists()) {
            const beatData = beatSnap.data();

            // Try to get the license from the purchase data or fallback to the beat data
            const license = purchaseData.license || beatData.license || "No License Information";

            userPurchasedTracks.push({
              id: purchaseDoc.id,
              beatId: beatId,
              coverUrl: beatData.coverUrl || "./images/default-cover.jpg",
              title: purchaseData.song || "Unknown Title",
              license: license, // Ensure license info is fetched from either purchase or beat
              audioUrl: beatData.musicUrls?.mp3 || null, // Fetch mp3 file URL safely
              timestamp: purchaseData.timestamp?.toDate().toLocaleString() || "Unknown Date",
            });
          }
        }

        // Save to localStorage
        localStorage.setItem("purchasedTracks", JSON.stringify(userPurchasedTracks));
        setLikedSongs(userPurchasedTracks); // Updated likedSongs to purchasedTracks

      } catch (error) {
        console.error("Error fetching purchased tracks:", error);
      }
    };

    fetchLikedSongs();
    fetchPurchasedTracks(); // Now fetch the purchased tracks
  }, []);

  const handlePlayPause = (songUrl, index) => {
    if (!songUrl) return;

    if (playingIndex === index) {
      if (audio) audio.pause();
      setPlayingIndex(null);
    } else {
      if (audio) audio.pause();
      const newAudio = new Audio(songUrl);
      newAudio.play();
      setAudio(newAudio);
      setPlayingIndex(index);

      newAudio.onended = () => {
        setPlayingIndex(null);
      };
    }
  };

  return (
    <div className="favourite-page">
      <GroupA />
      <h1>Purchased Tracks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : likedSongs.length === 0 ? (
        <p>You haven't purchased any tracks yet.</p>
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
                {/* Play/Pause Button */}
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

                <img src={song.coverUrl} className="listimage" alt={song.title} />
                <div className="track-info">
                  <div className="track-title">{song.title || "Unknown Title"}</div>
                  {/* License Info */}
                  <div className="track-license">License: {song.license || "Unknown License"}</div>
                </div>
              </div>

              <div className="favioriteSection2">
                <LikeButton size="1.5em" songId={song.id} />

                {/* View Track Button */}
                <Link to="/addToCart" state={{ song }}>
                  <button className="FaCartShopping">View Track</button>
                </Link>

                {/* Download Button */}
                {song.audioUrl ? (
                  <a href={song.audioUrl} download>
                    <button className="FaCartShopping">
                      <FaDownload /> Download
                    </button>
                  </a>
                ) : (
                  <button className="downloadButton" disabled>
                    No Download
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default PurchasedTracksPage;