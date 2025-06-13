import React from "react";

export function GroupF() {
    return (
      <div className="GroupF">
        <div className="footer-wrapper">
          <div className="footer-container">
            <img src="/beathub1.PNG" alt="logo" />
            <p>
              Discover high quality instrumental beats that set <br></br>the tone for your 
              next hit. For custom beats<br /> and exclusive rights,
              get in touch with us.
            </p>
            <a>Contact Us</a>
            <p>info@urbeathub.com</p>
          </div>

          <div className="footer-container1">
            <p>
              <a href="/Licensedetails" target="_blank">License</a>
            </p>
            <p>
              <a href="/startsellingpage">Start Selling</a>
            </p>
            <p>
              <a href="/privacy" target="_blank">Privacy Policy</a>
            </p>
            <p>
              <a href="/Refundpolicy" target="_blank">Refund Policy</a>
            </p>
            <p>
              <a href="/MusicDistributionForm" target="_blank">Distribution</a>
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/share/15xxw68L9H/" target="_blank">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/beathubhq?igsh=bzdlenlmYmM0MXlx" target="_blank">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@beathubhq?_t=ZG-8tPb3wugnPU&_r=1" target="_blank">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="https://www.youtube.com/@urbeathub?si=c-RKHuS-4-0C6Ve6" target="_blank">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="accordion-container">
            <fieldset>
              <legend>FAQ</legend>
            </fieldset>
            <button className="accordion">
              What Happens When My License Expires?
            </button>
            <div className="content">
              <p>We are here</p>
            </div>

            <button className="accordion">How Do I Renew My License?</button>
            <div className="content">
              <p>We are here</p>
            </div>

            <button className="accordion">
              How Do I Buy Exclusive Rights?
            </button>
            <div className="content">
              <p>We are here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

export function GroupG() {
    return (
      <footer className="footer">
        {/*Group Cb */}
        <p>Ur BeatHub is a Brand That Support African Musicians</p>
        <p>Copyright © urbeathub.com 2025</p>
      </footer>
    );
  }

export function SellBeatsInfo({ navigate }) {
  return (
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
        <button
          className="start-selling-button"
          onClick={() => navigate("/startsellingpage")}
        >
          Start Selling →
        </button>
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
  );
}