import React from 'react';
import "../css/component.css";

const myVideo = "/images/studio3.mp4"; // Correct path for public assets

function startsellingpage() {
  return (
    <>
    <div className="video-wrap">
        <video src={myVideo} autoPlay muted loop></video>
        <h1>Sell Beats and Build Your Brand</h1>
        <p>Join the next generation of music entrepreneurs and reach millions of creators looking to buy beats.</p>
   <button className="start-selling-button">GET STARTED</button>
    </div>

    <div className="why-sell-beat">
  <div className="why-sell-beat-container">
    <div className="why-sell-beat-box">
      <h2>Upload unlimited tracks, sound</h2>
      <p>Store as much content as you want, from MP3s, WAVs, and track stems.</p>
    </div>
    <div className="why-sell-beat-box">
      <h2>Enjoy instant payments and</h2>
      <p>Get paid instantly via credit card or direct bank transfer </p>
    </div>
  </div>
</div>

    </>
  );
}

export default startsellingpage;