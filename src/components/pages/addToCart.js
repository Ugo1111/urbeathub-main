import React, { useState } from "react";
import "../css/addToCart.css";
import {BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate} from "react-router-dom";



function AddToCart() {
    const location = useLocation();
    const song = location.state?.song;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const [newComment, setNewComment] = useState(""); // State for the new comment
    const [comments, setComments] = useState(song?.comments || []); // Manage local comments state
  
  
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
  
    return (
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="logo">
            Ur Beat <p>Hub</p>
          </h1>
          <div className="search-bar">
            <input type="text" placeholder="Search for Instrumental" />
          </div>
          <div className="notification">
            <i className="bell-icon">🔔</i>
          </div>
        </header>
  
        {/* Main Section */}
        <main>
          <section className="beat-preview">
            <div className="image-placeholder">
              <img src={song.image} alt="Trending Instrumental" />
            </div>
            <div className="beat-details">
              <h2>{song.title}</h2>
              <p>An amazing piece of art</p>

              
              <div className="comments-list">
                {song.comments.map((comment, idx) => (
                  <p key={idx}>{comment}</p>
                ))}
              </div>

              <Link to="/"><button>Back</button></Link>

                {/* Add Comment Section */}
            <div className="add-comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button onClick={addComment}>Submit Comment</button>
            </div>
                


              <section className="song">
                <button onClick={handlePlayPause}>
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
                />
              </section>
              <h3>$29.00 - $99.00</h3>
              <p className="terms">
                (By purchasing this license, it means you've reviewed and agreed
                to the Track(s) License Agreement)
              </p>
              <div className="license-options">
                <div className="license-option">
                  <h4>Basic Lease</h4>
                  <p>$29.99</p>
                  <span>MP3</span>
                </div>
                <div className="license-option">
                  <h4>Premium Lease</h4>
                  <p>$59.99</p>
                  <span>MP3 + WAV</span>
                </div>
                <div className="license-option">
                  <h4>Trackout Lease</h4>
                  <p>$99.99</p>
                  <span>MP3 + WAV + STEMS</span>
                </div>
              </div>
              <button className="buy-btn">BUY NOW</button>
            </div>
          </section>
        </main>
        {/* License Info */}
           <div className="line2">
           <section className="license-info">
             <h4>Basic Lease | Premium Lease | Trackout Lease</h4>
             <ul>
               <li>Receive a High-Quality MP3</li>
               <li>Use it Commercially</li>
               <li>Sell up to 5,000 Copies</li>
               <li>Available for 10,000 Streams</li>
               <li>No YouTube Monetization</li>
               <li>Must Credit urbeathub</li>
             </ul>
           </section>
          {/* Additional Beats */}
           <section className="beat-cards">
             <div className="beat-card">
               <img src="./images/gooseumps.jpg" alt="Leg Up" />
               <h4>Leg Up</h4>
               <button className="select-btn">Select Options</button>
             </div>
             <div className="beat-card">
               <img src="./images/gooseumps.jpg" alt="Momentum" />
               <h4>Momentum</h4>
               <button className="select-btn">Select Options</button>
             </div>
             <div className="beat-card">
               <img src="./images/gooseumps.jpg" alt="Shaft" />
               <h4>Shaft</h4>
               <button className="select-btn">Select Options</button>
             </div>
           </section>
           </div>
          <h2>GENRE</h2>
           {/* Genre Section */}
        
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
         {/* Contact Section */}
           <section className="contact">
             <p>
               You Can Get <span>Exclusive / Unlimited Rights</span>
             </p>
             <button className="contact-btn">Contact Us</button>
           </section>
        
         {/* Footer */}
         <footer>
           <div className="footer-logo">Ur Beat Hub</div>
           <div className="footer-links">
             <p>LICENSE</p>
             <p>START SELLING</p>
             <p>FAQ</p>
           </div>
           <div className="footer-contact">
             <p>Contact us: info@urbeathub.com</p>
           </div>
        </footer>
       </div>
     );
  }
     
  
  // Helper function to format time in mm:ss format
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
export default AddToCart;  