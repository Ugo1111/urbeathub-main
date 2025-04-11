import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { GiNextButton, GiPreviousButton } from "react-icons/gi";
import djImage from '../../images/dj.jpg';



function MusicPlayer({ 
  currentSong, 
  isPlaying, 
  togglePlayPause, 
  currentTime, 
  duration, 
  formatTime, 
  handleSliderChange, 
  playPrevious, 
  playNext, 
  volume, 
  handleVolumeChange, 
  increaseVolume, 
  decreaseVolume 
}) {
  return (
    <div className="GroupC1">
      <div className="musicControlerA">
        <div className="imageWrapper">
          <img src={currentSong?.coverUrl || djImage} alt={`Cover for ${currentSong?.title || "Untitled"}`} />
          <button className="playIcon" onClick={() => togglePlayPause()}>
            {isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
          </button>
        </div>
      </div>

      <div className="musicControlerB">
        <div className="controllerB1">
          <h4>{currentSong?.title || "Untitled"}</h4>
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
          <span>{formatTime(duration)}</span>
        </div>

        <div className="controllerB3">
          <button onClick={playPrevious}>
            <GiPreviousButton size="1em" />
          </button>
          <button onClick={playNext}>
            <GiNextButton size="1em" />
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
  <button onClick={increaseVolume} style={{ fontSize: "1em" }}>+</button>
  <button onClick={decreaseVolume} style={{ fontSize: "1em" }}>-</button>
</div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;