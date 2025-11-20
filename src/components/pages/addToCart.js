import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import "../css/addToCart.css";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import GroupA from "../component/header.js";

import { Helmet } from "react-helmet-async";
import { ToastContainer, toast } from "react-toastify";
import {
  FaPlay,
  FaShareAlt,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import LicensingSection from "../component/licenseSection.js";
import LikeButton from "../component/LikeButton";
import Comment from "../component/CommentSection";
import RecomendationComponent, { ProducerTracksComponent } from "../component/recomendationComponent";
import ShareModal from "../component/ShareModal";
import djImage from "../../images/dj.jpg";
import { useParams } from "react-router-dom";
import { extractIdFromSlug } from "../utils/slugify";
import BeatsList from "../component/searchComponent.js";
import { toggleFollowUser } from "../component/followUser";
import { useFormatPrice } from "../utils/formatPrice";

function AddToCart() {
  const { slug } = useParams();
  const songId = extractIdFromSlug(slug);
  const [song, setSong] = useState(null);
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(song?.comments || []);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
  const audioRef = useRef(null); // Reference to audio element
  const db = getFirestore();
  const [showLicensing, setShowLicensing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleShareClick = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const formatPrice = useFormatPrice();

  const basicPriceUSD = song?.monetization?.basic?.price || 7.99;
  const basicLicensePrice = formatPrice(basicPriceUSD);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Reset immediately when new song loads
    setIsFollowing(null);
  
    const checkFollowing = async () => {
      if (!currentUser || !song?.userId) return;
  
      try {
        const producerSocialRef = doc(db, "Social", song.userId);
        const producerSnap = await getDoc(producerSocialRef);
  
        if (producerSnap.exists()) {
          const followers = producerSnap.data().followers || [];
          setIsFollowing(followers.includes(currentUser.uid));
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("Error checking follow state:", err);
        setIsFollowing(false);
      }
    };
  
    checkFollowing();
  }, [song?.userId, currentUser]);
  
  const handleFollowClick = async () => {
    try {
      const newState = await toggleFollowUser(db, song.userId);
      setIsFollowing(newState);
    } catch (err) {
      console.error("Follow error:", err);
      alert("Please log in to follow a producer.");
    }
  };

  useEffect(() => {
    if (showLicensing) {
      // disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // enable scroll again
      document.body.style.overflow = "auto";
    }

    // cleanup just in case
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLicensing]);

  // Fetch song data if not passed through state
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const db = getFirestore();
        const songRef = doc(db, "beats", songId);
        const songSnap = await getDoc(songRef);

        if (songSnap.exists()) {
          setSong({ id: songSnap.id, ...songSnap.data() });
        } else {
          console.error("Song not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching song:", error);
      }
    };

    // ✅ Run only when songId is available
    if (songId && !location.state?.song) {
      fetchSong();
    } else if (location.state?.song) {
      setSong(location.state.song);
    }
  }, [songId, location.state]);

  useEffect(() => {
    const fetchMonetizationData = async () => {
      if (!song?.id) return;

      try {
        const songDocRef = doc(db, `beats/${song.id}`);
        const songDocSnap = await getDoc(songDocRef);

        if (songDocSnap.exists()) {
          const monetization = songDocSnap.data().monetization;
          setIsDownloadEnabled(monetization?.free?.enabled === true);
        }
      } catch (error) {
        console.error("Error fetching monetization data:", error);
      }
    };

    fetchMonetizationData();
  }, [song?.id, db]);

  // Handle play/pause toggle
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src) {
        audio.src = song.musicUrls?.taggedMp3; // Set the audio source if not already set
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
    if (!audio || !song?.musicUrls?.taggedMp3) return;

    // ✅ Ensure source is loaded before adding events
    audio.src = song.musicUrls.taggedMp3;
    audio.load();

    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    // ✅ Clean up
    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [song]);

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
    return (
      <div className="loading-container">
        <p>Loading song...</p>
      </div>
    );
  }



  return (
    <>
      <Helmet>
        <title>
          {song.title ? `${song.title} | UrbeatHub` : "Add to Cart"}
        </title>
        <meta
          name="description"
          content={`Buy and download "${song.title}" by ${song.username || "Unknown Artist"
            }. High-quality instrumental available instantly.`}
        />

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content={`${song.title} | ${song.username || "Unknown Artist"}`}
        />
        <meta
          property="og:description"
          content="Listen, buy, and download high-quality beats instantly on UrbeatHub."
        />
        <meta
          property="og:image"
          content={
            song.coverUrl ||
            "https://urbeathub.com/ur_beathub_og_image_1200x630.png"
          }
        />
        <meta
          property="og:url"
          content={`https://urbeathub.com/addToCart/${song.id}`}
        />
        <meta property="og:type" content="music.song" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${song.title} | ${song.username || "Unknown Artist"}`}
        />
        <meta
          name="twitter:description"
          content="Listen, buy, and download high-quality beats instantly on UrbeatHub."
        />
        <meta
          name="twitter:image"
          content={
            song.coverUrl ||
            "https://urbeathub.com/ur_beathub_og_image_1200x630.png"
          }
        />
      </Helmet>
      <GroupA className={"GroupA"} />
      <div className="mobile-only-search">
        <BeatsList className="header" />
      </div>
      <div className="theMainContainer">
        <div className="container">
          <div className="songBioSection">
            <SongBio song={song} isDownloadEnabled={isDownloadEnabled} className="BioInformationSection"  handleShareClick={handleShareClick}  handleFollowClick={handleFollowClick}
  isFollowing={isFollowing}
  currentUser={currentUser}/>
          </div>
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
              setShowLicensing={setShowLicensing}
              isDownloadEnabled={isDownloadEnabled}
              handleShareClick={handleShareClick}
              isFollowing={isFollowing}
              handleFollowClick={handleFollowClick}
              basicLicensePrice={basicLicensePrice}
            />

            <div className="addtoCartPage-mobile-view-songBio">
              <SongBio song={song}  className="mobileView-BioInformationSection"  />
            </div>


            {song.username && (
              <div className="you-may-like-heading">
                <h2 >
                  More Tracks From {song.username}
                </h2>

                <ProducerTracksComponent producerId={song.userId} />
              </div>
            )}


            <LicensingSection
              className="licensing-container"
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

      {showLicensing && (
        <div
          className="licensing-popup-overlay"
          onClick={() => setShowLicensing(false)}
        >
          <div
            className="licensing-popup"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <LicensingSection
              className="mobileView-licensing-container"
              accordionOpen={true}
              toggleAccordion={() => { }}
              song={song}
            />
            <button
              className="close-licensing-btn"
              onClick={() => setShowLicensing(false)}
            >
              ✕
            </button>
          </div>
        </div>

)}
{showModal && (
  <ShareModal song={song} onClose={closeModal} />
)}
    </>
  );
}

function Mp3player({
  isDownloadEnabled,
  handleShareClick,
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
  setShowLicensing,handleFollowClick, isFollowing,
  basicLicensePrice
}) {



  
  return (
    <section className="Mp3player">
      <div className="beat-details">
        <div className="addtoCartPage-mobile-view-coverImg-and-title">
          <div className="addtoCartPage-mobile-view-coverImg">
            {" "}
            <img src={song.coverUrl || djImage} alt="Trending Instrumental" />
          </div>

          <div className="addtoCartPage-mobile-view-beat-title-and-artist">
            <h2 className="" title={song.title}>{song.title}</h2>

            <div className="addtoCartPage-mobile-view-producerName">
            {song.username && (
  <span>
    by {song.username} ·
    <button
      onClick={handleFollowClick}
     className="follow-producer-button"
     title={`Stay updated! Follow ${song.username}`}
    >
     {isFollowing ? "Following" : "Follow"}
    </button>
  </span>
)}
             
            </div>

            <section className="song">
              <button
                className="addtoCartPage-play-button"
                onClick={handlePlayPause}
                style={{ marginRight: "15px" }}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSliderChange}
                className="thesong"
              />
              <span>{formatTime(duration)}</span>
              <audio ref={audioRef} src={song.musicUrls?.taggedMp3} />
              <input
                className="volume"
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
        </div>

        <div className="addtoCartPage-mobile-view-buy-like-share">
          <div>
            <LikeButton size="1.5em" songId={song.id} />
          </div>

          <div>
            <FaShareAlt size="1.5em" color="" onClick={handleShareClick} />{" "}
          </div>
          {isDownloadEnabled && (
            <a
              href={song.musicUrls.taggedMp3}
              download={song.title}
              style={{ textDecoration: "none" }}
            className="mp3Player-DownloadButton" title="Download for Free">
                <IoMdDownload size="1.8em" /> 
             
            </a>
          )}
          <button
            className="addtoCartPage-mobileView-buyButton"
            onClick={() => setShowLicensing(true)}
          >
              Buy From {basicLicensePrice}
          </button>
        </div>

      </div>
    </section>
  );
}

function SongBio({ song, className, isDownloadEnabled , handleShareClick,handleFollowClick, isFollowing,currentUser}) {

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const db = getFirestore();

  const openReportModal = () => setShowReportModal(true);
  const closeReportModal = () => setShowReportModal(false);
  const [activeTab, setActiveTab] = useState("");

  const handleReportSubmit = async () => {
    if (!reportReason) {
      toast.error("Please select a reason for reporting.", {
        position: "top-center",
      });
      return;
    }

    try {
      const reportsCollection = collection(db, `beats/${song.id}/reports`);

      await addDoc(reportsCollection, {
        reason: reportReason,
        comment: reportComment,
        timestamp: new Date(),
      });

      toast.success("Report submitted successfully.", {
        position: "top-center",
      });

      setReportReason("");
      setReportComment("");
      closeReportModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Try again.", {
        position: "top-center",
      });
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
    <>
      <div className="addToCartPage-mobileView-bio-tabs">
        <div className="addToCartPage-mobileView-bio-TrackDetails">
          Track details
        </div>
        <button
          className="addToCartPage-bio-chevron-buttons"
          onClick={() =>
            setActiveTab((prev) => (prev === "info" ? "" : "info"))
          }
        >
          {activeTab === "info" && <FaChevronUp />}
          {activeTab === "" && <FaChevronDown />}
        </button>
      </div>
      {className === "BioInformationSection" && (<div className="producerProfilePage-info">
        <CoverArt coverUrl={song.coverUrl} />

        <h3
          className="addToCartPage-bio-song-Tille "
          style={{ padding: "10px", textAlign: "center" }}
        >
          {song.title}
        </h3>
        <div className="addtoCartPage-mobile-view-prodName">
        {song.username && (
  <span>
    by {song.username} ·
    <button
      onClick={handleFollowClick}
     className="follow-producer-button"
     title={`Stay updated! Follow ${song.username}`}
    >
     {isFollowing ? "Following" : "Follow"}
    </button>
  </span>
)}
             
            </div>


        <span className="item-actions">
          {/* <div>
           <FaPlay size="1.5em" />
           <div>{song.playCount}</div>
           </div> */}

          <div>
            <LikeButton size="1.5em" songId={song.id} />
          </div>

          <div>
            <FaShareAlt size="1.5em" color="" onClick={handleShareClick} />
            <div>{song.playCount}</div>
          </div>
          {/* 
            <div>
           <RiAddLargeFill size="1.5em" style={{ color: "red" }} />
           <div>{song.playCount}</div>
           </div> */}
        </span>

        {isDownloadEnabled && (
          <a
            href={song.musicUrls.taggedMp3}
            download={song.title}
            style={{ textDecoration: "none" }}
          >
            <div className="IoMdDownload">
              <IoMdDownload size="1.5em" /> Download for Free
            </div>
          </a>
        )}

        <hr />

        <div className={className}>
          <h4 className="BioInformationSection-title">Information</h4>
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
                <button
                  onClick={handleReportSubmit}
                  className="report-submit"
                >
                  Submit Report
                </button>
                <button onClick={closeReportModal} className="report-cancel">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>


      </div>
      )}


      {activeTab === "info" && (
        <div className="producerProfilePage-info">






          <hr />

          <div className={className}>
            <h4 className="BioInformationSection-title">Information</h4>
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
                  <button
                    onClick={handleReportSubmit}
                    className="report-submit"
                  >
                    Submit Report
                  </button>
                  <button onClick={closeReportModal} className="report-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      )}
    </>
  );
}

function CoverArt({ coverUrl }) {
  return (
    <div className="image-placeholder">
      <img src={coverUrl || djImage} alt="Trending Instrumental" />
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
