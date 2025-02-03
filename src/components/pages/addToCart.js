import React, { useState, useEffect, useRef } from "react";
import "../css/addToCart.css";
import { useLocation } from "react-router-dom";
import { Profilepicture } from "../AuthState";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import { TbSend } from "react-icons/tb";
import { FaPlay, FaShareAlt, FaHeart, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { RiAddLargeFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { IoIosContact } from "react-icons/io";
import LicensingSection  from "../component/licenseSection.js";

function AddToCart() {
  const location = useLocation();
  const song = location.state?.song; // Get the song passed through state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(song?.comments || []);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const audioRef = useRef(null); // Reference to audio element

  // Handle play/pause toggle
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress slider change
  const handleSliderChange = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume slider change
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // Update current time and duration
  useEffect(() => {
    const audio = audioRef.current;
    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  // Add new comment
  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      song.comments.push(newComment);  // Optionally update the song's comments
      setNewComment("");
    }
  };

  // Handle license accordion toggle
  const toggleAccordion = () => setAccordionOpen(!accordionOpen);

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Render the page if song is valid
  if (!song) {
    return <p>No song selected. Go back to the audio list.</p>;
  }

  return (
    <>
      <GroupA />
      <div className="theMainContainer">
        <div className="container">
          <SongBio song={song} />
          <div className="secondContainer">
            <Mp3player
              song={song}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              handlePlayPause={handlePlayPause}
              handleSliderChange={handleSliderChange}
              handleVolumeChange={handleVolumeChange}
              audioRef={audioRef}
              volume={volume}
              formatTime={formatTime}
            />
            < LicensingSection  accordionOpen={accordionOpen} toggleAccordion={toggleAccordion} />
            <Comment
              song={song}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              addComment={addComment}
            />
            <Genre />
          </div>
        </div>
      </div>
    </>
  );
}

function Mp3player({ song, isPlaying, currentTime, duration, handlePlayPause, handleSliderChange, handleVolumeChange, audioRef, volume, formatTime }) {
  return (
    <section className="Mp3player">
      <div className="beat-details">
        <h2>{song.title}</h2>
        <section className="song">
          <button onClick={handlePlayPause} style={{ marginRight: "15px" }}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span>{formatTime(currentTime)}</span>
          <input
            className="thesong"
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSliderChange}
          />
          <span>{formatTime(duration)}</span>
          <audio ref={audioRef} src={song.url} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{ marginLeft: "15px" }}
          />
        </section>
      </div>
    </section>
  );
}

function SongBio({ song }) {
  return (
    <div className="songBioSection">
      <CoverArt image={song.image} />
      <h3 style={{ padding: "10px", textAlign: "center" }}>{song.title}</h3>
      <span className="item-actions">
        <div>
          <FaPlay size="1.5em" />
          <div>{song.playCount}</div>
        </div>
        <div>
          <FaHeart size="1.5em" />
          <div>{song.playCount}</div>
        </div>
        <div>
          <FaShareAlt size="1.5em" />
          <div>{song.playCount}</div>
        </div>
        <div>
          <RiAddLargeFill size="1.5em" />
          <div>{song.playCount}</div>
        </div>
      </span>
      <div className="IoMdDownload">
        <IoMdDownload size="1.5em" /> Download for Free
      </div>
      <hr />
      <div className="BioInformationSection">
        <h4>Information</h4>
        <div>
          <span>Published</span>
          <span>{song.length} May 25, 2020</span>
        </div>
        <div>
          <span>BPM</span>
          <span>{song.length} 131</span>
        </div>
      </div>
    </div>
  );
}

function CoverArt({ image }) {
  return (
    <div className="image-placeholder">
      <img src={image} alt="Trending Instrumental" />
    </div>
  );
}

function Comment({ song, comments, newComment, setNewComment, addComment }) {
  return (
    <section className="comment">
      <h1>Comments</h1>
      <div className="add-comment">
        <Profilepicture />
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <button onClick={addComment}>
          <TbSend className="send-icon" />
        </button>
      </div>
      <div className="comments-list">
        {comments.map((comment, idx) => (
          <div className="comments-list-container" key={idx}>
            <IoIosContact size="2.5em" />
            <div>
              <div>{song.title}</div>
              <p>{comment}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Genre() {
  return (
    <>
      <h2>GENRE</h2>
      <section className="genre">
        <div className="genre-options">
          <div className="genre-card">
            <img src="./images/killerman amapiano.png" alt="Afro Beat" />
            <h4>AFRO BEAT</h4>
          </div>
          <div className="genre-card">
            <img src="./images/killerman amapiano.png" alt="Pop Beat" />
            <h4>POP BEAT</h4>
          </div>
          <div className="genre-card">
            <img src="./images/killerman amapiano.png" alt="High Life Beat" />
            <h4>HIGH LIFE BEAT</h4>
          </div>
          <div className="genre-card">
            <img src="./images/killerman amapiano.png" alt="RnB Beat" />
            <h4>RnB BEAT</h4>
          </div>
        </div>
      </section>
    </>
  );
}



export default AddToCart;