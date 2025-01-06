import React, { useState, useRef, useEffect } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import { GiNextButton, GiPreviousButton } from "react-icons/gi";
import { FaPlay, FaPause  } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import "../css/HomePage.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function HomePage() {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [newComment, setNewComment] = useState("");
  const audioRef = useRef(null);

  // Play a specific song by index and automatically start playing
  const playSong = (index) => {
    setCurrentIndex(index);
    if (!isPlaying) {
      setIsPlaying(true); // Ensure the song plays when selected
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false); // Pauses the audio
    } else {
      audio.play().then(() => {
        setIsPlaying(true); // Immediately start playing
      }).catch((error) => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      });
    }
  };

  // Play next song and automatically start playing
  const playNext = () => {
    const nextIndex = (currentIndex + 1) % songs.length; // Loop back to the first song after the last one
    setCurrentIndex(nextIndex);
    if (!isPlaying) {
      setIsPlaying(true); // Ensure the song plays when switching to the next one
    }
  };

  // Play previous song and automatically start playing
  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length; // Loop back to the last song after the first one
    setCurrentIndex(prevIndex);
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

  // This effect handles updating current time and duration
  useEffect(() => {
    const audio = audioRef.current;

    // Update currentTime and duration when timeupdate and loadedmetadata events fire
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    // Event listeners for timeupdate and loadedmetadata
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  // Automatically update and play the selected song when the index changes
  useEffect(() => {
    const audio = audioRef.current;
    audio.src = songs[currentIndex].url; // Update the song source when currentIndex changes
    audio.load(); // Reload the song source

    if (isPlaying) {
      audio.play().catch((error) => console.error("Playback failed:", error));
    } else {
      audio.pause();
    }
  }, [currentIndex, isPlaying]);

  function GroupB() {
    return (
      <div className="GroupB">
        <div style={{ fontSize: "25px", margin: "30px 0 180px 0" }}>
          BeatHub is a brand that supports afrobeat artists
        </div>
        <div className="">
          <h1 style={{ color: "#db3056" }}>
            BeatHub is a brand that supports afrobeat artists
          </h1>
          <h5 style={{ fontSize: "0.6em", padding: "0 180px" }}>
            BeatHub is a brand that supports afrobeat artists BeatHub is a brand
            that supports afrobeat artists BeatHub is a brand that supports
            afrobeat artists
          </h5>
        </div>
      </div>
    );
  }

  function GroupC1() {
    return (
      <div className="GroupC1">
        <div className="musicControlerA">
          <div className="imageWrapper">
            <img
              src={songs[currentIndex].image}
              alt={`Cover for ${songs[currentIndex].title}`}
            />
            <button className="playIcon" onClick={togglePlayPause}>
              {isPlaying ? <FaPause size="2.5em" /> : <FaPlay size="2.5em" />}
            </button>
          </div>
        </div>

        <div className="musicControlerB">
          <div className="controllerB1">
            <h4>{songs[currentIndex].title}</h4>
          </div>

          <div className="controllerB2">

          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSliderChange}
            className="progress"
          />
          <span>{formatTime(duration)}</span></div>

          <div className="controllerB3">
            <button onClick={playPrevious}>
              <GiPreviousButton size="1.5em" />
            </button>
            <button onClick={playNext}>
              <GiNextButton size="1.5em" />
            </button>

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
        <div className="songcontainer">
          {songs.map((song, index) => (
            <div
              className="songlist"
              key={index}
              onClick={() => playSong(index)} // Clicking on a song immediately plays it
            >
              <img src={song.image} className="listimage" alt={song.title} />
              {song.title}

              <div className="market">
               
                  <Link to="/buysong" state={{ song }}>
                    <button>
                      <FaCartShopping color="" size="1.5em" />
                    </button>
                  </Link>

                  <button>
                    <FaShareAlt size="1.5em" />
                  </button>

                  <button>
                  <SlOptionsVertical size="1.5em" />
                  </button>
                
              </div>
            </div>
          ))}
        </div>

        <audio ref={audioRef} >
          <source src={songs[currentIndex].url} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  function GroupD() {
    return (
      <div className="comments">
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