import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import GroupA from "../component/header.js";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";
import "../css/checkout.css";
import djImage from "../../images/dj.jpg";


function PurchasedTracksPage() {
  const [purchasedTracks, setPurchasedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [audio, setAudio] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  const licenseFiles = {
    "Basic License": ["MP3"],
    "Premium License": ["MP3", "WAV"],
    "Unlimited License": ["MP3", "WAV", "STEM"],
    "Exclusive License": ["MP3", "WAV", "STEM"], // Optional, same as Unlimited
  };



  useEffect(() => {
    let unsubscribePurchases; // Firestore listener
    const licenseTier = {
      "Basic License": 1,
      "Premium License": 2,
      "Unlimited License": 3,
      "Exclusive License": 4,
    };
  
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
  
      const purchasesRef = collection(db, `beatHubUsers/${user.uid}/purchases`);
  
      unsubscribePurchases = onSnapshot(purchasesRef, async (snapshot) => {
        try {
          let userPurchasedTracks = [];
  
          for (const purchaseDoc of snapshot.docs) {
            const purchaseData = purchaseDoc.data();
            const purchaseRef = purchaseData.ref;
  
            if (purchaseRef) {
              const purchaseSnap = await getDoc(purchaseRef);
              if (purchaseSnap.exists()) {
                const purchaseDetails = purchaseSnap.data();
                const beatId = purchaseDetails.beatId;
  
                const beatRef = doc(db, "beats", beatId);
                const beatSnap = await getDoc(beatRef);
                if (beatSnap.exists()) {
                  const beatData = beatSnap.data();
                  userPurchasedTracks.push({
                    id: purchaseDoc.id,
                    beatId,
                    coverUrl: beatData.coverUrl || djImage,
                    title: purchaseDetails.song || "Unknown Title",
                    license: purchaseDetails.license || "No License",
                    audioUrl: beatData.musicUrls?.mp3 || null,
                    waveUrl: beatData.musicUrls?.wav || null,
                    zipUrl: beatData.musicUrls?.zipUrl || null,
                    timestamp:
                      purchaseDetails.timestamp?.toDate().toLocaleString() || "Unknown Date",
                  });
                }
              }
            }
          }
  
          // Deduplicate by song title, keep highest tier
          const filteredTracks = Object.values(
            userPurchasedTracks.reduce((acc, track) => {
              const existing = acc[track.title];
              const currentTier = licenseTier[track.license] || 0;
              const existingTier = existing ? licenseTier[existing.license] || 0 : 0;
  
              if (!existing || currentTier > existingTier) {
                acc[track.title] = track;
              }
  
              return acc;
            }, {})
          );
  
          setPurchasedTracks(filteredTracks);
          localStorage.setItem("purchasedTracks", JSON.stringify(filteredTracks));
          setLoading(false);
  
        } catch (error) {
          console.error("Error fetching purchased tracks:", error);
          setLoading(false);
        }
      });
    });
  
    return () => {
      unsubscribeAuth(); // Cleanup auth listener
      if (unsubscribePurchases) unsubscribePurchases(); // Cleanup purchases listener
    };
  }, [auth, db]);

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

  const getDownloadButtons = (song) => {
    const license = song.license?.toLowerCase() || "";

    const isPremium = license.includes("premium");
    const isUnlimitedOrExclusive =
      license.includes("unlimited") || license.includes("exclusive");

    return (
      <div className="download-options">
        {/* MP3 download – for all */}
        {song.audioUrl && (
          <a href={song.audioUrl} download>
            <button className="FaCartShopping">
              <FaDownload /> MP3
            </button>
          </a>
        )}

        {/* WAV download – for Premium, Unlimited, Exclusive */}
        {(isPremium || isUnlimitedOrExclusive) && song.waveUrl && (
          <a href={song.waveUrl} download>
            <button className="FaCartShopping">
              <FaDownload /> WAV
            </button>
          </a>
        )}

        {/* ZIP download – for Unlimited, Exclusive */}
        {isUnlimitedOrExclusive && song.zipUrl && (
          <a href={song.zipUrl} download>
            <button className="FaCartShopping">
              <FaDownload /> ZIP
            </button>
          </a>
        )}
      </div>
    );
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
                  <button
                    className="playButton"
                    onClick={() => handlePlayPause(song.audioUrl, index)}
                  >
                    <FaPause />
                  </button>
                ) : hoveredIndex === index ? (
                  <button
                    className="playButton"
                    onClick={() => handlePlayPause(song.audioUrl, index)}
                  >
                    <FaPlay />
                  </button>
                ) : (
                  <span className="customNumber">{index + 1}.</span>
                )}

                <img
                  src={song.coverUrl}
                  className="listimage"
                  alt={song.title}
                />
                <div className="track-info">
                  <div className="track-title">{song.title}</div>
                  <div className="track-license">
   {song.license} (
  {licenseFiles[song.license]?.join(", ") || "MP3"})
</div>
                </div>
              </div>

              <div className="favioriteSection2">{getDownloadButtons(song)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default PurchasedTracksPage;