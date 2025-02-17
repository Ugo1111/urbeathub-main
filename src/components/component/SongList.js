import React from "react";
import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { SlOptionsVertical } from "react-icons/sl";
import LikeButton from "./LikeButton";
import Download from "../component/download.js";
import ShareModal from "./ShareModal";
import {  FaShareAlt } from "react-icons/fa";

function SongList({ songs, playSong, selectedSong, setSelectedSong }) {
  const openShareModal = (song, event) => {
    event.stopPropagation(); // Prevent triggering play on click
    setSelectedSong(song);
  };

  return (
    <div className="GroupC2">
      <div className="songcontainer">
        {songs.map((song, index) => (
            <div className="songlist" key={song.id} onClick={() => playSong(index)}>            <img 
              src={song.coverUrl || "./images/default-cover.jpg"} 
              className="listimage" 
              alt={song.title || "Untitled"} 
            />
            <div className="songListTitle">
              {song.title || "Unknown Title"}
              <div style={{ fontSize: "0.65em" }}>
                <LikeButton songId={song.id} />
              </div>
            </div>

            <div className="market">
              <Link to="/buysong" state={{ song }}>
                <button><FaCartShopping size="1.5em" /></button>
              </Link>

              <Download song={song} />

              <button onClick={(event) => openShareModal(song, event)}>
                <FaShareAlt size="1.5em" /> Share
              </button>

              <Link to="/loginPage">
                <button><SlOptionsVertical size="1.5em" /></button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {selectedSong && <ShareModal song={selectedSong} onClose={() => setSelectedSong(null)} />}
    </div>
  );
}

export default SongList;