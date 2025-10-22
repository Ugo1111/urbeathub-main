import React, { useState, useRef, useEffect, useCallback } from "react";
import { ProducerGroupA } from "../component/header.js"; // Default import
import "../css/HomePage.css";
import AboutProducer from "../component/AboutProducer.js"; // Default import
import { GroupG, GroupF } from "../component/footer.js"; // Use named import for GroupG
import "../css/component.css";
import MusicPlayer from "../component/MusicPlayer"; // Default import
import SongList from "../component/SongList"; // Default import
import FeedbackForm from "../component/FeedbackForm"; // Default import
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { ProducersHeroPage } from "../component/HeroPage"; // Use named import for ProducersHeroPage
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

function ProducersStore() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { userId } = useParams();

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicCollectionRef = collection(db, "beats");
        const querySnapshot = await getDocs(musicCollectionRef);
        const musicList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((music) => music.status === true && music.userId === userId);
        setSongs(musicList);
      } catch (error) {
        console.error("Error fetching music:", error);
      }
    };

    if (userId) {
      fetchMusic();
    }
  }, [userId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Sync default volume
    }
  }, [volume]);

  const toggleFeedbackForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const playSong = (index) => {
    if (!songs[index]) {
      console.error("Song not found at index:", index);
      return;
    }

    const song = songs[index];
    const audioUrl = song.musicUrls?.taggedMp3;

    if (!audioUrl) {
      console.error("Audio URL is missing for song:", song.title || "Untitled");
      return;
    }

    if (!audioRef.current) {
      console.error("Audio element is not initialized.");
      return;
    }

    setCurrentIndex(index);
    setIsPlaying(true);

    audioRef.current.src = audioUrl;
    audioRef.current.load();

    audioRef.current.oncanplaythrough = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((error) => console.error("Playback failed:", error));
      }
    };
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src && songs.length > 0) {
        playSong(currentIndex);
      } else {
        audioRef.current.play().catch((error) => console.error("Playback failed:", error));
      }
    }

    setIsPlaying(!isPlaying);
  };

  const playNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(nextIndex);
  }, [currentIndex, songs]);

  const playPrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
  }, [currentIndex, songs]);

  const formatTime = (time) => `${Math.floor(time / 60)}:${("0" + Math.floor(time % 60)).slice(-2)}`;

  const handleSliderChange = useCallback((e) => {
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(e.target.value);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    setVolume(e.target.value);
    audioRef.current.volume = e.target.value;
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatOptions = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      <Helmet>
        <title>Browse & Buy Beats – Trap, Drill, Afrobeats & More</title>
        <meta name="google-site-verification" content="K0fOZTnTt94pq3xFMMzzOFU7DYpQGUG0F7Mv2zq8F8I" />
        <meta
          name="description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta property="og:title" content="High Quality Instrumental beats for Artists | Buy & Download Instantly" />
        <meta
          property="og:description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta property="og:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
        <meta property="og:url" content="https://urbeathub.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="High Quality Instrumental Beats for Artists | Buy & Download Instantly" />
        <meta
          name="twitter:description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta name="twitter:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
      </Helmet>
      <div className="homepageWrapper">
        <div className="overlay"></div>
        <ProducerGroupA />
        <ProducersHeroPage />
        {/* Hidden Audio Player */}
        <audio
          ref={audioRef}
          onCanPlay={() => {
            if (isPlaying && audioRef.current) {
              audioRef.current.play().catch((error) => console.error("Playback failed:", error));
            }
          }}
          onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          onEnded={playNext}
        />

        <MusicPlayer
          currentSong={songs[currentIndex]}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          currentTime={currentTime}
          duration={duration}
          formatTime={formatTime}
          handleSliderChange={handleSliderChange}
          playPrevious={playPrevious}
          playNext={playNext}
          volume={volume}
          handleVolumeChange={handleVolumeChange}
          increaseVolume={() => setVolume(Math.min(1, volume + 0.1))}
          decreaseVolume={() => setVolume(Math.max(0, volume - 0.1))}
        />

        <SongList songs={songs} playSong={playSong} selectedSong={selectedSong} setSelectedSong={setSelectedSong} />

        {/* About Producer Section */}
        <AboutProducer />
         <GroupF />
        <GroupG />
      </div>
      {/* WhatsApp Chat Button */}
      <div id="whatsapp-chat" style={{ position: "fixed", bottom: 50, right: 20, zIndex: 1000 }}>
        <button
          onClick={toggleChatOptions}
          style={{
            backgroundColor: "#db3056",
            color: "white",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "30px",
            textAlign: "center",
            lineHeight: "60px",
            border: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          💬
        </button>

        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              padding: "10px",
              textAlign: "center",
              position: "absolute",
              bottom: 70,
              right: 0,
              width: "200px",
            }}
          >
            <p style={{ margin: 0, color: "black" }}>Chat with:</p>
            <a href="https://wa.me/447776727121?text=Hi%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
              <button
                style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}
              >
                Lee
              </button>
            </a>
            or
            <a href="https://wa.me/2347011886514?text=Hi%20I%20need%20help%20with%20your%20services" target="_blank" rel="noopener noreferrer">
              <button
                style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}
              >
                Tayexy
              </button>
            </a>
          </div>
        )}
      </div>

      {/* Feedback Form Button */}
      <button className="vertical-feedback-btn" onClick={toggleFeedbackForm}>
        FEEDBACK
      </button>

      {/* Feedback Form */}
      {isFormOpen && <FeedbackForm onClose={toggleFeedbackForm} />}
    </div>
  );
}

export default ProducersStore;