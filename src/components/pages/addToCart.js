import React, { useState } from "react";
import "../css/addToCart.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Profilepicture } from "../AuthState";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import { TbSend } from "react-icons/tb";
import { FaPlay } from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";
import { RiAddLargeFill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { IoIosContact } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";







function AddToCart() {
  const location = useLocation();
  const song = location.state?.song;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const [newComment, setNewComment] = useState(""); // State for the new comment
  const [comments, setComments] = useState(song?.comments || []); // Manage local comments state



  const [accodianing, setAccodianing] = useState(true);






  const audioRef = React.useRef(null);

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

  const handleSliderChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = e.target.value;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = e.target.value;
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(audio.duration);
  };

  const addComment = () => {
    if (newComment.trim()) {
      // Update the local state
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);

      // If necessary, update the song object (if the parent is using location.state)
      song.comments.push(newComment);

      // Clear the input field
      setNewComment("");
    }
  };

  if (!song) {
    return <p>No song selected. Go back to the audio list.</p>;
  }

  // Genre sectiion
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

  //song SongBio section
  function SongBio() {
    return (
      <>
        <div className="songBioSection">
          <CoverArt />
          <h3 style={{ padding: "10px", textAlign: "center" }}>{song.title}</h3>

          <span className="item-actions">
            <div>
              <FaPlay size="1.5em" />
              <div>{song.playCount}11</div>
            </div>

            <div>
              <FaHeart size="1.5em" />
              <div>{song.playCount}11</div>
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

          <div className="IoMdDownload ">
            <IoMdDownload size="1.5em" /> Download for Free
          </div>

          <hr></hr>

          <div className="BioInformationSection">
            <h4>Information</h4>
            <div>
              <span>Published</span>
              <span>{song.length}May 25, 2020</span>
            </div>

            <div>
              <span>BPM</span>
              <span>{song.length}131</span>
            </div>

            <div>
              <span>Published</span>
              <span>{song.length}May 25, 2020</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // cover art sectiion
  function CoverArt() {
    return (
      <>
        <div className="image-placeholder">
          <img src={song.image} alt="Trending Instrumental" />
        </div>
      </>
    );
  }

  // comment sectiion
  function Comment() {
    return (
      <section className="comment">
        <h1>Comments</h1>

        <div className="add-comment">
          <Profilepicture className="" />
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
          />
          <button onClick={addComment}>
            <TbSend onClick={addComment} className="send-icon" />
          </button>
        </div>

        <div className="comments-list">
          {song.comments.map((comment, idx) => (
            <div className="comments-list-container">
              <div key={idx}>
                {" "}
                <IoIosContact size="2.5em" />
              </div>{" "}
              <div>
                <div>{song.title}</div> <p>{comment}</p>{" "}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function LicensingSection() {
    const [selectedLicense, setSelectedLicense] = useState("basic");

    // Data as an object from a database
    const licenses = {
      basic: {
        name: "Basic License",
        price: "$25.00",
        details: "MP3",
        usageTerms: [
          "Used for Music Recording",
          "Distribute up to 2,500 copies",
          "500,000 Online Audio Streams",
          "UNLIMITED Music Video",
          "For Profit Live Performances",
          "Radio Broadcasting rights (2 Stations)",
        ],
      },

      premium: {
        name: "Premium License",
        price: "$35.00",
        details: "MP3, WAV",
        usageTerms: [
          "Used for Music Recording",
          "Distribute up to 2,500 copies",
          "500,000 Online Audio Streams",
          "UNLIMITED Music Video",
          "For Profit Live Performances",
          "Radio Broadcasting rights (2 Stations)",
        ],
      },

      wavStems: {
        name: "Wav stems",
        price: "$50.00",
        details: "STEMS, MP3, WAV",
        usageTerms: [
          "Used for Music Recording",
          "Distribute up to 2,500 copies",
          "500,000 Online Audio Streams",
          "UNLIMITED Music Video",
          "For Profit Live Performances",
          "Radio Broadcasting rights (2 Stations)",
        ],
      },
      unlimited: {
        name: "Unlimited License",
        price: "$85.00",
        details: "STEMS, MP3, WAV",
      },
      exclusive: {
        name: "Exclusive License",
        price: "Negotiate price",
        details: "STEMS, MP3, WAV",
      },
    };

    return (
      <div className="licensing-container">
        <span className="licensing-header">
          <h2>Licensing</h2>
          <div className="checkout">
            <span>
              Total: {licenses[selectedLicense]?.price || "Select a license"}
            </span>
            <button className="add-to-cart-btn">Add to Cart</button>
            <button className="buy-now-btn">Buy now</button>
          </div>
        </span>

        <hr></hr>

        <div className="licenses">
          {Object.entries(licenses).map(([key, license]) => (
            <div
              key={key}
              className={`license-card ${
                selectedLicense === key ? "active" : ""
              }`}
              onClick={() => setSelectedLicense(key)}
            >
              <h3>{license.name}</h3>
              <p>{license.price}</p>
              <small>{license.details}</small>
            </div>
          ))}
        </div>

        <hr></hr>
        <div className="usageTermHeader">
            <h3 className="usageTermHeaderh3">Usage Terms</h3> <button onClick={() => setAccodianing(!accodianing)}>
         {accodianing ? <FaChevronUp size="1.5em"/> :  <FaChevronDown size="1.5em"/>}
      </button>
          </div>

          <div
        className={accodianing ? "accordionin" : "panel"}
      >
       

          <br></br>
          <span>{licenses[selectedLicense]?.name}</span>
          <span> ({licenses[selectedLicense]?.price})</span>
          <br></br>
          <br></br>
          <div className="usageTermSection">
            {licenses[selectedLicense]?.usageTerms?.map((term, index) => (
              <div key={index} className="usageTermList">
                {term}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function Mp3player() {
    return (
      <section className="Mp3player">
        <br></br>
        <div className="beat-details">
          <h2>{song.title}</h2>
          <br></br>

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
            <audio
              ref={audioRef}
              src={song.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            >
              Your browser does not support the audio element.
            </audio>
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

  return (
    <><GroupA />
    <div className="theMainContainer">
      
      <div className="container">
        <SongBio />
        <div className="secondContainer">
          <Mp3player />
          <LicensingSection />
          <Comment />
          <Genre />
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to format time in mm:ss format
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
export default AddToCart;
