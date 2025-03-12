import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import GroupA from "../component/header.js";
import LikeButton from "../component/LikeButton";
import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa"; // Import Icons
import "../css/checkout.css";

function PurchasedTracksPage() {
  const [purchasedTracks, setPurchasedTracks] = useState(() => {
    // Load from localStorage on initial render
    const storedTracks = localStorage.getItem("purchasedTracks");
    return storedTracks ? JSON.parse(storedTracks) : [];
  });

  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [audio, setAudio] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchPurchasedTracks = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let userPurchasedTracks = [];
        const purchasesRef = collection(db, beatHubUsers/${user.uid}/purchases);
        const purchasesSnapshot = await getDocs(purchasesRef);

        for (const purchaseDoc of purchasesSnapshot.docs) {
          const purchaseData = purchaseDoc.data();
          const beatId = purchaseData.beatId;

          // Fetch beat details
          const beatRef = doc(db, "beats", beatId);
          const beatSnap = await getDoc(beatRef);

          if (beatSnap.exists()) {
            const beatData = beatSnap.data();

            userPurchasedTracks.push({
              id: purchaseDoc.id,
              beatId: beatId,
              coverUrl: beatData.coverUrl || "./images/default-cover.jpg",
              title: purchaseData.song || "Unknown Title",
              license: purchaseData.license || "No License Information",
              audioUrl: beatData.musicUrls?.mp3 || null, // Fetch mp3 file URL safely
              timestamp: purchaseData.timestamp?.toDate().toLocaleString() || "Unknown Date",
            });
          }
        }

        // Save to localStorage
        localStorage.setItem("purchasedTracks", JSON.stringify(userPurchasedTracks));

        setPurchasedTracks(userPurchasedTracks);
      } catch (error) {
        console.error("Error fetching purchased tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if localStorage has no data
    if (purchasedTracks.length === 0) {
      fetchPurchasedTracks();
    } else {
      setLoading(false);
    }
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
      ) : purchasedTracks.length === 0 ? (
        <p>You haven't purchased any tracks yet.</p>
      ) : (
        <ol className="Ol4favouriteList">
          {purchasedTracks.map((song, index) => (
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
                  <div className="track-title">{song.title}</div>
                  <div className="track-license">License: {song.license}</div>
                  <div className="track-timestamp">Purchased on: {song.timestamp}</div>
                </div>
              </div>

              <div className="favioriteSection2">
                <LikeButton size="1.5em" songId={song.id} />
                <Link to={/beat/${song.beatId}}>
                  <button className="FaCartShopping">View Track</button>
                </Link>

                {/* Download Button */}
                {song.audioUrl ? (
                  <a href={song.audioUrl} download>
                    <button className="downloadButton">
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