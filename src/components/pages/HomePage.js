import React, { useState, useRef, useEffect } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import { GiNextButton, GiPreviousButton } from "react-icons/gi";
import { FaPlay, FaPause  } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import "../css/component.css";

import GroupA from "../component/header.js";
import Download from "../component/download.js";

import { GroupE, GroupF, GroupG } from "../component/footer.js";
import "../css/HomePage.css";
import "../css/component.css";

import { Link } from "react-router-dom"; 

function HomePage() {
  const [songs, setSongs] = useState([
    {
      title: "Afro Swing",
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

  // Play a specific song by index
  const playSong = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((error) => {
          console.error("Playback failed:", error);
        });
        setIsPlaying(true);
      }
    }
  };

  const playNext = () => {
    setCurrentIndex((currentIndex + 1) % songs.length);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
    setIsPlaying(true);
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
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const increaseVolume = () => {
    const newVolume = Math.min(volume + 0.1, 1);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const decreaseVolume = () => {
    const newVolume = Math.max(volume - 0.1, 0);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
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
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = songs[currentIndex].url;
    audio.load();

    if (isPlaying) {
      audio.play().catch((error) => console.error("Playback failed:", error));
    } else {
      audio.pause();
    }

    setCurrentTime(0); // Reset current time when the song changes
  }, [currentIndex, isPlaying]);


  function GroupB() {
    return (
      <div className="GroupB">
        <div >
          BeatHub is a brand that supports afrobeat artists
        </div>
        <div className="heroText">
          <h4 >
            BeatHub is a brand that supports afrobeat artists
          </h4>
          <p>
            BeatHub is a brand that supports afrobeat artists BeatHub is a brand
            that supports afrobeat artists BeatHub is a brand that supports
            afrobeat artists
          </p>
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
                  <Download to="/buysong" state={{ song }}/>
                  <button>
                    <FaShareAlt size="1.5em" />
                  </button>
                  <Link to="/loginPage" >
                  <button>
                  <SlOptionsVertical size="1.5em" />
                  </button>
                  </Link>
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
      {/* <GroupD /> */}
      <GroupE />
      <GroupF />
      <GroupG />
    </div>
  );
}

export default HomePage;