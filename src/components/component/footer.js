export function GroupF() {
    return (
      <div className="GroupF">
        <div className="footer-wrapper">
          <div className="footer-container">
            <img src="/beathub1.PNG" alt="logo" />
            <p>
              Discover the beats that set the tone <br />for your 
              next hit. For custom beats<br /> and exclusive rights,
              get in touch with us.
            </p>
            <a href="contact.html">Contact Us</a>
            <p>info@urbeathub.com</p>
          </div>

          <div className="footer-container1">
            <p>
              <a href="/Licensedetails">License</a>
            </p>
            <p>
              <a href="link">Start Selling</a>
            </p>
            <p>
              <a href="/privacy">Privacy Policy</a>
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com" target="_blank">
                <i className="fab fa-facebook">facebook</i>
              </a>
              <a href="https://www.instagram.com" target="_blank">
                <i className="fab fa-instagram">instagram</i>
              </a>
              <a href="https://www.tiktok.com" target="_blank">
                <i className="fab fa-tiktok">Tiktok</i>
              </a>
              <a href="https://www.youtube.com" target="_blank">
                <i className="fab fa-youtube">youtube</i>
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
        <p>BeatHub is a Brand That Support African Musicians</p>
        <p>COPYRIGHT BEATHUB 2025</p>
      </footer>
    );
  }