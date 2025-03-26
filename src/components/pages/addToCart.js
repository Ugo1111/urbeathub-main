import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, addDoc, doc } from "firebase/firestore";
import "../css/addToCart.css";
import { useLocation } from "react-router-dom";
import { Profilepicture } from "../AuthState";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import { TbSend } from "react-icons/tb";
import {
  FaPlay,
  FaShareAlt,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { RiAddLargeFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { IoIosContact } from "react-icons/io";
import LicensingSection from "../component/licenseSection.js";
import LikeButton from "../component/LikeButton";
import Comment from "../component/CommentSection";
import RecomendationComponent from "../component/recomendationComponent";
import ShareModal from "../component/ShareModal";
import { Timestamp } from "firebase/firestore"; // Import Firestore Timestamp

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
      if (!audio.src) {
        audio.src = song.musicUrls?.mp3; // Set the audio source if not already set
        audio.load(); // Load the audio source
      }
      audio.play().catch((error) => console.error("Playback failed:", error));
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

    if (audio) {
      audio.addEventListener("timeupdate", updateCurrentTime);
      audio.addEventListener("loadedmetadata", updateDuration);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateCurrentTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
      }
    };
  }, []);

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
            <LicensingSection
              accordionOpen={accordionOpen}
              toggleAccordion={toggleAccordion}
              song={song}
            />

            <Comment
              song={song}
              comments={comments}
              setComments={setComments} // Pass setComments to update comments in AddToCart
            />
            <RecomendationComponent />
          </div>
        </div>
      </div>
    </>
  );
}

function Mp3player({
  song,
  isPlaying,
  currentTime,
  duration,
  handlePlayPause,
  handleSliderChange,
  handleVolumeChange,
  audioRef,
  volume,
  formatTime,
}) {
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
          <audio ref={audioRef} src={song.musicUrls?.taggedMp3} />
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
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const db = getFirestore();

  const handleShareClick = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openReportModal = () => setShowReportModal(true);
  const closeReportModal = () => setShowReportModal(false);

  const handleReportSubmit = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }

    try {
      const reportsCollection = collection(db, `beats/${song.id}/reports`);

      await addDoc(reportsCollection, {
        reason: reportReason,
        comment: reportComment,
        timestamp: new Date(),
      });

      alert("Report submitted successfully.");
      setReportReason("");
      setReportComment("");
      closeReportModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Try again.");
    }
  };

  let date = song.timestamp
    ? new Date(song.timestamp.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="songBioSection">
      <CoverArt coverUrl={song.coverUrl} />
      <h3 style={{ padding: "10px", textAlign: "center" }}>{song.title}</h3>

      <span className="item-actions">
        <div>
          <FaPlay size="1.5em" />
          <div>{song.playCount}</div>
        </div>

        <div>
          <LikeButton size="1.5em" songId={song.id} />
        </div>

        <div>
          <FaShareAlt size="1.5em" color="blue" onClick={handleShareClick} />
          <div>{song.playCount}</div>
        </div>

        <div>
          <RiAddLargeFill size="1.5em" style={{ color: "red" }} />
          <div>{song.playCount}</div>
        </div>
      </span>

      <a
        href={song.musicUrls.mp3}
        download={song.title}
        style={{ textDecoration: "none" }}
      >
        <div className="IoMdDownload">
          <IoMdDownload size="1.5em" /> Download for Free
        </div>
      </a>

      <hr />

      <div className="BioInformationSection">
        <h4>Information</h4>
        <div>
          <span>Published</span>
          <span>{date}</span>
        </div>
        <div>
          <span>BPM</span>
          <span>{song.metadata?.bpm || "-"}</span>
        </div>
        <div>
          <span>Genres</span>
          <span>{song.metadata?.genres || "-"}</span>
        </div>
        <div>
          <span>Key</span>
          <span>{song.metadata?.key || "-"}</span>
        </div>
        <div>
          <span>Mood</span>
          <span>{song.metadata?.moods || "-"}</span>
        </div>
      </div>
      <hr />

      <div className="report-section">
        <button onClick={openReportModal} className="report-button">
          ⚠️ Report Track
        </button>

        {showReportModal && (
          <div className="report-modal">
            <h3>Report Track</h3>
            <label>Reason:</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="report-select"
            >
              <option value="">Select a reason</option>
              <option value="Copyright infringement">
                Copyright infringement
              </option>
              <option value="Offensive content">Offensive content</option>
              <option value="Spam or misleading">Spam or misleading</option>
              <option value="Other">Other</option>
            </select>

            <label>Additional Comments (optional):</label>
            <textarea
              value={reportComment}
              onChange={(e) => setReportComment(e.target.value)}
              placeholder="Write your comments here..."
              className="report-textarea"
            />

            <div className="report-modal-actions">
              <button onClick={handleReportSubmit} className="report-submit">
                Submit Report
              </button>
              <button onClick={closeReportModal} className="report-cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <ShareModal song={song} onClose={closeModal} />}
    </div>
  );
}

function CoverArt({ coverUrl }) {
  return (
    <div className="image-placeholder">
      <img src={coverUrl} alt="Trending Instrumental" />
    </div>
  );
}

// function Genre() {
//   return (
//     <>
//       <h2>GENRE</h2>
//       <section className="genre">
//         <div className="genre-options">
//           <div className="genre-card">
//             <img src="./images/killerman amapiano.png" alt="Afro Beat" />
//             <h4>AFRO BEAT</h4>
//           </div>
//           <div className="genre-card">
//             <img src="./images/killerman amapiano.png" alt="Pop Beat" />
//             <h4>POP BEAT</h4>
//           </div>
//           <div className="genre-card">
//             <img src="./images/killerman amapiano.png" alt="High Life Beat" />
//             <h4>HIGH LIFE BEAT</h4>
//           </div>
//           <div className="genre-card">
//             <img src="./images/killerman amapiano.png" alt="RnB Beat" />
//             <h4>RnB BEAT</h4>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

export default AddToCart;
