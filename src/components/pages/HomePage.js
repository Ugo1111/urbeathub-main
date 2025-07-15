import React, { useState, useRef, useEffect, useCallback } from "react";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import SellBeatSection from "../component/SellBeatSection.js"; 
import "../css/HomePage.css";
import "../css/component.css";
import MusicPlayer from "../component/MusicPlayer";
import SongList from "../component/SongList";
import FeedbackForm from "../component/FeedbackForm"; // Import FeedbackForm
import { collection, getDocs } from "firebase/firestore"; // Import Firestore methods
import { db } from "../../firebase/firebase"; // Import Firestore
import { HeroPage } from "../component/HeroPage"; // Use named import for HeroPage
import { Helmet } from "react-helmet";
import WhatsAppChat from "../component/WhatsAppChat.js";

function HomePage() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicCollectionRef = collection(db, "beats");
        const querySnapshot = await getDocs(musicCollectionRef);
        const musicList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter((music) => music.status === true);
        setSongs(musicList);
      } catch (error) {
        console.error("Error fetching music:", error);
      }
    };

    fetchMusic();
  }, []);

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

    setCurrentIndex(index); // Update the song index
    setIsPlaying(true); // Mark as playing

    audioRef.current.src = audioUrl; // Set the source of the audio to taggedMp3
    audioRef.current.load(); // Reload to ensure we have the latest song URL

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
      audioRef.current.pause(); // Pause the current song
    } else {
      if (!audioRef.current.src && songs.length > 0) {
        playSong(currentIndex); // Play the current song if not already loaded
      } else {
        audioRef.current.play().catch((error) => console.error("Playback failed:", error)); // Play the current song
      }
    }
    
    setIsPlaying(!isPlaying); // Toggle the state for play/pause
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
  const handleSliderChange = useCallback((e) => { audioRef.current.currentTime = e.target.value; setCurrentTime(e.target.value); }, []);
  const handleVolumeChange = useCallback((e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }, []);

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
        <GroupA />
        <HeroPage />
        {/* Hidden Audio Player */}
        <audio 
          ref={audioRef}
          onCanPlay={() => {
            if (isPlaying && audioRef.current) {
              audioRef.current.play().catch((error) => console.error("Playback failed:", error));
            }
          }} // Auto-play when ready
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
        <SellBeatSection />
        <GroupF />
        <GroupG /> 
      </div>
      <WhatsAppChat />
      {/* Feedback Form Button */}
      <button className="vertical-feedback-btn" onClick={toggleFeedbackForm}>
        FEEDBACK
      </button>

      {/* Feedback Form */}
      {isFormOpen && <FeedbackForm onClose={toggleFeedbackForm} />}
    </div>
  );
}

export default HomePage;