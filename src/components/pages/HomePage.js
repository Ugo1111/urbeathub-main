import React, { useState, useRef, useEffect, useCallback} from "react";
import GroupA from "../component/header.js";
import { GroupE, GroupF, GroupG } from "../component/footer.js";
import "../css/HomePage.css";
import "../css/component.css";
import MusicPlayer from "../component/MusicPlayer";
import SongList from "../component/SongList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import HeroPage from "../component/HeroPage"; // Adjust path as needed

function HomePage() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const [selectedSong, setSelectedSong] = useState(null);

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

  const playSong = (index) => {
    if (!songs[index] || !audioRef.current) return;
    
    setCurrentIndex(index); // Update the song index
    setIsPlaying(true); // Mark as playing
  
    audioRef.current.src = songs[index].musicUrls?.taggedMp3;  // Set the source of the audio to taggedMp3
   
    // Wait until audio can be played before calling play
    audioRef.current.load(); // Reload to ensure we have the latest song URL
    audioRef.current.oncanplaythrough = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => console.error("Playback failed:", error));
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

  const playNext = useCallback(() => setCurrentIndex((currentIndex + 1) % songs.length), [currentIndex, songs.length]);
  const playPrevious = useCallback(() => setCurrentIndex((currentIndex - 1 + songs.length) % songs.length), [currentIndex, songs.length]);

  const formatTime = (time) => `${Math.floor(time / 60)}:${("0" + Math.floor(time % 60)).slice(-2)}`;
  const handleSliderChange = useCallback((e) => { audioRef.current.currentTime = e.target.value; setCurrentTime(e.target.value); }, []);
  const handleVolumeChange = useCallback((e) => { setVolume(e.target.value); audioRef.current.volume = e.target.value; }, []);

  return (
    <div className="homepageWrapper">
       <div class="overlay"></div>
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
 
    <GroupE/> <GroupF/> <GroupG/> 
  </div>
  );
}

export default HomePage;