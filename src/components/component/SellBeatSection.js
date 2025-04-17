import React from 'react';
import "../css/component.css"; 
// Use a relative path for public assets
const Mixer = "/images/Mixer.jpg";

function SellBeatSection() {
  return (
    <>
      <section className="hero2">
        <div className="hero2-overlay"></div>
        <div className="hero2-wrapper">
          <div className="hero2-container">
            <img src={Mixer} alt="Mixer" className="mixer" /> 
          </div>
          <div className="hero2-container1">
            <h2>Explore Our Collection of High-Quality <br></br>Instrumentals, for Every Genre and Mood</h2>
            <ul>
              <li>Dive into a world of exceptional instrumentals carefully crafted to elevate your music</li>
              <li>Whether you're seeking the perfect beat for a new track or a signature sound for your next project, our collection has you covered</li>
              <li>Simple licensing options. Our contracts are not confusing. Spend less time scratching your head and more time recording your next hit.</li>
          <li>Find the perfect beat that resonates with your unique style and take your music to the next level</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sellbeat">
        <div className="sellbeat-container">
          <h2>Why sell beats using urbeathub?</h2>
          <ul>
            <li>No Setup or Monthly Fee</li>
            <li>Accept Bank card and Mobile Money Payment</li>
            <li>Upload unlimited beats</li>
            <li>Offer Unlimited free downloads</li>
            <li>Keep 70% of your earnings per transaction</li>
            <li>Right audience for your beats</li>
            <li>Get premium support</li>
            <li>Dashboard Access</li>
            <li>All this 100% FREE. No upfront payment needed</li>
          </ul>
          <a className="buy-link">Start Selling</a>
        </div>

        <div className="sellbeat-container1">
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
    </>
  );
}

export default SellBeatSection;
