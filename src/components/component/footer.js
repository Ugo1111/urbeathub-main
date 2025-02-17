export function GroupE() {
    return (
      <div className="GroupF">
        {/*GroupF*/}
        <section className="newsletter">
          <div className="newsletter1">
            <h4>Stay up-to-date with our newsletter</h4>
            <p>Join now and get 15% off your next purchase</p>
            {/* Input for email */}
            <input
              type="email"
              className="submit-button"
              placeholder="Enter your email..."
            />
            {/* Submit button */}
            <p>
              <input
                type="submit"
                className="buy-link"
                value="Subscribe now!"
              />
            </p>
          </div>

          <div className="credibility">
            <h4>Credibility</h4>
          </div>
        </section>
      </div>
    );
  }

  export function GroupF() {
    return (
      <div className="GroupF">
        <div className="footer-wrapper">
          <div className="footer-container">
            <img src="./beathub1.jpg" alt="logo" />
            <p>
              Discover the beats that set the tone for your <br />
              next hit. For custom beats and exclusive rights, <br />
              get in touch with us.
            </p>
            <a href="contact.html">Contact Us</a>
            <p>info@urbeathub.com</p>
          </div>

          <div className="footer-container1">
            <p>
              <a href="link">License</a>
            </p>
            <p>
              <a href="link">Start Selling</a>
            </p>
            <p>
              <a href="link">Privacy Policy</a>
            </p>
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
      <footer className="GroupCb">
        {/*Group Cb */}
        <p>BeatHub is a Brand That Support African Musicians</p>
        <p>COPYRIGHT BEATHUB 2024</p>
      </footer>
    );
  }