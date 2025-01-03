import React, { useState, useRef, useEffect } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";

import "../css/HomePage.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

//Header Logo
function Headerlogo() {
  return (
    <a href="/" className="Headerlogo">
      <img src="./beathub1.jpg" style={{ width: "64px", height: "64px" }}></img>
    </a>
  );
}

//Header search bar
function HeaderSearchBar() {
  return (
    <input
      type="text"
      className="HeaderSearchBar"
      value=" 🔎 search for your song"
    ></input>
  );
}

//Header cart Icon
function HeaderCartIcon() {
  return (
    <div className="HeaderCartIcon"><FaCartShopping color="" size="1.5em" />
    
    </div>
  );
}

// This is where The audio player starts, I copied all the JSX you created to this function
function HomePage() {
  // These are the functions that makes the audio player work
  const [songs, setSongs] = useState([
    {
      title: "Afro Swing ",
      image: "./images/gooseumps.jpg",
      url: "./beats/Afro-Swing-watermark.m4a",
      comments: [],
    },
    {
      title: "Jman beat",
      image: "./images/jmanbeat.jpg",
      url: "./beats/Jmanbeat-watermark.m4a",
      comments: [],
    },
    {
      title: "Killerman Amapiano",
      image: "./images/killerman amapiano.png",
      url: "./beats/Amapiano-watermark.m4a",
      comments: [],
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0); // Index of the currently selected song.
  const [isPlaying, setIsPlaying] = useState(false); // State to track play/pause status.
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [newComment, setNewComment] = useState(""); // To handle input for comments

  const audioRef = useRef(null); // Reference to the audio player.

  // Play a specific song by index.
  const playSong = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true); // Set playing state to true.
    if (audioRef.current) {
      audioRef.current.load(); // Load the new song.
      audioRef.current
        .play() // Play the song.
        .catch((error) => console.error("Playback failed:", error));
    }
  };

  // Toggle play/pause for the current song.
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause(); // Pause the song if it's playing.
      } else {
        audioRef.current
          .play() // Play the song if it's paused.
          .catch((error) => console.error("Playback failed:", error));
      }
      setIsPlaying(!isPlaying); // Toggle play/pause state.
    }
  };

  // Play the next song.
  const playNext = () => {
    const nextIndex = (currentIndex + 1) % songs.length; // Wrap around if at the end.
    playSong(nextIndex);
  };

  // Play the previous song.
  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length; // Wrap around if at the beginning.
    playSong(prevIndex);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSliderChange = (e) => {
    const audio = audioRef.current;
    const newTime = e.target.value;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const increaseVolume = () => {
    const newVolume = Math.min(volume + 0.1, 1);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const decreaseVolume = () => {
    const newVolume = Math.max(volume - 0.1, 0);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const addComment = () => {
    if (newComment.trim()) {
      const updatedSongs = [...songs];
      updatedSongs[currentIndex].comments.push(newComment);
      setSongs(updatedSongs);
      setNewComment("");
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  // This is where the JSX starts to render, I copied all your JSX to this place, Because of the Router

  function GroupA() {
    return (
      <div className="GroupA">
        <Headerlogo /> <HeaderSearchBar /> <HeaderCartIcon />{" "}
      </div>
    );
  }

  function GroupB() {
    return (
      <div className="GroupB">
        <div style={{ fontSize: "25px", margin: "30px 0 180px 0" }}>
          BeatHub is a brand that supports afrobeat artist
        </div>
        <div className="">
          <h1 style={{ color: "#db3056" }}>
            BeatHub is a brand that supports afrobeat artist
          </h1>
          <h5 style={{ fontSize: "0.6em", padding: "0 180px" }}>
            BeatHub is a brand that supports afrobeat artist BeatHub is a brand
            that supports afrobeat artist BeatHub is a brand that supports
            afrobeat artist
          </h5>
        </div>
      </div>
    );
  }

  function GroupC1() {
    return (
      <div className="GroupC1">
        <div className="musicControlerPicture"> <img
          src={songs[currentIndex].image}
          alt={`Cover for ${songs[currentIndex].title}`}
         
        /></div>




        <div className="musicControler">
        <div className="top">
          {/*The Play/Pause Button*/}
          <button onClick={togglePlayPause}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          {/* Display the current song title */}
          <h2>{songs[currentIndex].title}</h2>
        </div>

        {/*The progress Bar*/}
        <span>{formatTime(duration)}</span>

        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSliderChange}
          className="progress"
        />
        <span>{formatTime(currentTime)}</span>

        {/* Navigation */}
        <div className="nav">
          <button onClick={playPrevious}> Previous</button>
          <button onClick={playNext}>Next</button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />

          <div className="volnav">
            <button onClick={increaseVolume}>+</button>
            <button onClick={decreaseVolume}>-</button>
          </div>
        </div>

        </div>
      </div>
    );
  }

  function GroupC2() {
    return (
      <div className="GroupC2">
        {/* Render a list of songs */}

        <div className="songcontainer">
          {songs.map((song, index) => (
            <div
              className="songlist"
              key={index} // Unique key for each song.
              onClick={() => playSong(index)} // Play the selected song on click.
            >
              <img src={song.image} className="listimage" />
              {song.title}

              <div className="market">
                <span>
                  <Link to="/buysong" state={{ song }}>
                    <button><FaCartShopping color="" size="1.5em" />
                    </button>
                  </Link>

                  <button ><FaShareAlt size="1.5em" />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Audio player element */}
        <audio ref={audioRef}>
          <source src={songs[currentIndex].url} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  function GroupD() {
    return (
      <div className="comments">
        {/* Comment Section */}
        <h4>Comments for {songs[currentIndex].title}</h4>
        <div className="comments-list">
          {songs[currentIndex].comments.map((comment, idx) => (
            <p key={idx}>{comment}</p>
          ))}
        </div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={addComment}>Add Comment</button>
      </div>
    );
  }

  function GroupE() {
    return (
      <div className="GroupF">
        {/*GroupF*/}
        <section className="newsletter">
          <div className="newsletter1">
            <h4>Stay up-to-date with our newsletter</h4>
            <p>Join now and get 15% off your next purchase</p>
            {/* Input for email */}
            <input
              type="email"
              className="submit-button"
              placeholder="Enter your email..."
            />
            {/* Submit button */}
            <p>
              <input
                type="submit"
                className="buy-link"
                value="Subscribe now!"
              />
            </p>
          </div>

          <div className="credibility">
            <h4>Credibility</h4>
          </div>
        </section>
      </div>
    );
  }

  function GroupF() {
    return (
      <div className="GroupCa">
        <div className="footer-wrapper">
          <div className="footer-container">
            <img src="./beathub1.jpg" alt="logo" />
            <p>
              Discover the beats that set the tone for your <br />
              next hit. For custom beats and exclusive rights, <br />
              get in touch with us.
            </p>
            <a href="contact.html">Contact Us</a>
            <p>info@urbeathub.com</p>
          </div>

          <div className="footer-container1">
            <p>
              <a href="link">License</a>
            </p>
            <p>
              <a href="link">Start Selling</a>
            </p>
            <p>
              <a href="link">Privacy Policy</a>
            </p>
          </div>

          <div className="accordion-container">
            <fieldset>
              <legend>FAQ</legend>
            </fieldset>
            <button className="accordion">
              What Happens When My License Expires?
            </button>
            <div className="content">
              <p>We are here</p>
            </div>

            <button className="accordion">How Do I Renew My License?</button>
            <div className="content">
              <p>We are here</p>
            </div>

            <button className="accordion">
              How Do I Buy Exclusive Rights?
            </button>
            <div className="content">
              <p>We are here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function GroupG() {
    return (
      <footer className="GroupCb">
        {/*Group Cb */}
        <p>BeatHub is a Brand That Support African Musicians</p>
        <p>COPYRIGHT BEATHUB 2024</p>
      </footer>
    );
  }

  return (
    <div className="homepageWrapper">
      <div className="homepageWrapper2"></div>
      <GroupA />
      <GroupB />
      <GroupC1 />
      <GroupC2 />
      <GroupD />
      <GroupE />
      <GroupF />
      <GroupG />
    </div>
  );
}
export default HomePage;
