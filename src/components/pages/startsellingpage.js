import React from 'react';
import "../css/component.css";
import GroupA from "../component/header.js";
import { GroupF, GroupG } from "../component/footer"; 
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
const myVideo = "/images/studio3.mp4"; // Correct path for public assets


function StartSellingPage() {
  const navigate = useNavigate();
  return (
    <>
    
    <Helmet>
        <title>Sell Your High Quality Instrumental Beats Online | Ur BeatHub</title>
        <meta
          name="description"
          content="Join Ur BeatHub and start selling your high quality instrumental beats to artists worldwide. Easy setup, fast payouts, and full creative control."
        />
        <meta property="og:title" content="Sell Your High Quality Instrumental Beats Online | Ur BeatHub" />
        <meta
          property="og:description"
          content="Join Ur BeatHub and start selling your high quality instrumental beats to artists worldwide. Easy setup, fast payouts, and full creative control."
        />
        <meta property="og:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
        <meta property="og:url" content="https://urbeathub.com" /> 
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sell Your High Quality Instrumental Beats Online | Ur BeatHub" />
        <meta
          name="twitter:description"
          content="Join Ur BeatHub and start selling your high quality instrumental beats to artists worldwide. Easy setup, fast payouts, and full creative control."
        />
        <meta name="twitter:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
      </Helmet>
      <GroupA />
    <div className="video-wrap">
  <video src={myVideo} autoPlay muted loop></video>
  <div className="video-content">
    <h1>Sell Beats and Build Your Brand</h1>
    <p>Join the next generation of music entrepreneurs and reach millions of creators looking to buy beats.</p>
    <button className="start-selling-button" onClick={() => navigate('/signUpPage')}>GET STARTED</button>
  </div>
</div>


    <div className="why-sell-beat">
  <div className="why-sell-beat-container">
    <div className="why-sell-beat-box">
    <h2><i className="fa fa-upload" style={{ marginRight: '10px', color: '#db3056' }}></i>Upload unlimited tracks and sound</h2>
 <p>Store as much content as you want, from MP3s, WAVs, and track stems.</p>
    </div>
    <div className="why-sell-beat-box">
      <h2><i className="fa fa-credit-card" style={{marginRight: '10px', fontSize: '24px', color: '#db3056' }}></i>Enjoy instant payments</h2>
      <p>Get paid instantly via bank transfer </p>
    </div>
  </div>
</div>

<section className="lease-section">
  <h2 className="lease-title">Available License Options</h2>
  <div className="lease-grid">
    <div className="lease-card">
      <h3 className="lease-card-title">Basic License</h3>
      <ul className="lease-features">
        <li>Receive a High Quality MP3</li>
        <li>Use It Commercially</li>
        <li>Sell Up To 5,000 Copies</li>
        <li>Available For 10,000 Streams</li>
        <li>No YouTube Monetization</li>
        <li>Must Credit Ur BeatHub</li>
      </ul>
    </div>

    <div className="lease-card highlight">
      <h3 className="lease-card-title">Premium License</h3>
      <ul className="lease-features">
        <li>Receive HQ MP3 & WAV</li>
        <li>Use It Commercially</li>
        <li>Sell Up To 10,000 Copies</li>
        <li>Available For 50,000 Streams</li>
        <li>YouTube Monetization</li>
        <li>Must Credit Ur BeatHub</li>
      </ul>
    </div>

    <div className="lease-card">
      <h3 className="lease-card-title">Unlimited License</h3>
      <ul className="lease-features">
        <li>Receive HQ MP3, WAV & Trackouts</li>
        <li>Use It Commercially</li>
        <li>Sell Up To 20,000 Copies</li>
        <li>Limited to 100,000 Streams</li>
        <li>YT Monetization + 1 Music Video</li>
        <li>Must Credit Ur BeatHub</li>
      </ul>
    </div>

    <div className="lease-card highlight">
      <h3 className="lease-card-title">Exclusive License</h3>
      <ul className="lease-features">
        <li>All rights transferred to you</li>
        <li>Unlimited sales, streams, monetization</li>
        <li>No credit required</li>
        <li>Beat is removed from store</li>
        <li>Best for artists wanting ownership</li>
      </ul>
    </div>
  </div>
</section>


<section className="sellbeat1">
        <div className="sellbeat-container">
          <h2>Why sell beats using urbeathub?</h2>
          <ul>
            <li>No Setup or Monthly Fee</li>
            <li>Accept Bank card and Mobile Money Payment</li>
            <li>Upload unlimited beats</li>
            <li>Offer Unlimited free downloads</li>
            <li>Keep 90% of your earnings per transaction</li>
            <li>Right audience for your beats</li>
            <li>Get premium support</li>
            <li>Dashboard Access</li>
            <li>All this 100% FREE. No upfront payment needed</li>
          </ul>
          <button className="start-selling-button" onClick={() => navigate('/signUpPage')}>Start Selling</button>
        </div>

        <div className="sellbeat-container1a">
          <h2>How Selling Beats works</h2>
          <ul>
            <li>Upload your files of the Beat you want to sell</li>
            <li>Input the licenses that you want to offer on your Beat</li>
            <li>Set prices for each license</li>
            <li>Publish the Beat</li>
            <li>Artists will be able to buy the Beat from all over the World</li>
            <li>GET PAID as people buy your Beat</li>
          </ul>
        </div>
      </section>

<GroupF />
<GroupG />
    </>
  );
}

export default StartSellingPage;