import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import LikeButton from "./LikeButton";
import Download from "../component/download.js";
import ShareModal from "./ShareModal";
import MoreOptions from "./moreOptions.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import djImage from '../../images/dj.jpg';
import { trackEvent } from "../../App"; // adjust path if needed



function SongList({ songs, playSong, selectedSong, setSelectedSong }) {
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const db = getFirestore();

  useEffect(() => {
    const fetchLikes = async () => {
      const songsWithLikes = await Promise.all(
        songs.map(async (song) => {
          const likesRef = collection(db, `beats/${song.id}/likes`);
          const likesSnapshot = await getDocs(likesRef);
          return { ...song, likes: likesSnapshot.size };
        })
      );

      // Sort songs by likes in descending order and then shuffle
      const sortedSongs = songsWithLikes.sort((a, b) => b.likes - a.likes);
      const shuffledSongs = sortedSongs.sort(() => 0.5 - Math.random());

      setDisplayedSongs(shuffledSongs.slice(0, 20));
    };

    fetchLikes();
  }, [songs, db]);

  const lastSongElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayedSongs((prevSongs) => {
            const newSongs = songs.slice(prevSongs.length, prevSongs.length + 20);
            if (newSongs.length === 0) {
              setHasMore(false);
            }
            return [...prevSongs, ...newSongs];
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, songs]
  );

  const openShareModal = (song, event) => {
    event.stopPropagation(); // Prevent triggering play on click
    setSelectedSong(song);
  };

  return (
    <div className="GroupC2">
      <div className="songcontainer">
        {displayedSongs.map((song, index) => (
          <div
            className="songlist"
            key={song.id}
            onClick={() => {
              const songIndex = songs.findIndex((s) => s.id === song.id);
              if (songIndex === -1 || !song.musicUrls?.taggedMp3) {
                console.error("Invalid song or missing audio URL:", song.title || "Untitled");
                return;
              }
              // Track play event in GA
  trackEvent({
    category: "Audio",
    action: "Play",
    label: song.title || "Unknown Track",
  });
              playSong(songIndex);
            }}
            ref={index === displayedSongs.length - 1 ? lastSongElementRef : null}
          >
            <img
              src={song.coverUrl || djImage}
              className="listimage"
              alt={song.title || "Untitled"}
            />
            <div className="songListTitle">
              {song.title || "Unknown Title"}
              <div style={{ fontSize: "0.8em" }}>
                <LikeButton songId={song.id} />
              </div>
            </div>

            <div className="market">
              <div className="songlist-taglist">
                {song.metadata?.tags?.map((tag, index) => (
                  <span key={index} className="songlist-tag">
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <Link to="/addToCart" state={{ song }}>
                <button className="songlist-addtochart">
                  <FaCartShopping style={{ marginRight: "6px" }} />${song.monetization?.basic?.price}
                </button>
              </Link>

              <MoreOptions song={song} openShareModal={openShareModal} className="MoreOptions-" />
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {selectedSong && (
        <ShareModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}
    </div>
  );
}

export default SongList;
