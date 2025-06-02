import React from 'react';
import "../css/component.css"; 
// Use a relative path for public assets
const Mixer = "/images/Mixer.jpg";


function AboutProducer() {
  return (
    <>
      <section className="hero2">
        <div className="hero2-overlay"></div>
        <div className="hero2-wrapper">
          <div className="hero2-container">
            <img src={Mixer} alt="Mixer" className="mixer" /> 
          </div>
          <div className="hero2-container1">
            <h2>About #producer</h2>
            <div>
              Dive into a world of exceptional instrumentals carefdivly crafted to elevate your music
              Whether you're seeking the perfect beat for a new track or a signature sound for your next project, our collection has you covered
              Simple licensing options. Our contracts are not confusing. Spend less time scratching your head and more time recording your next hit.
          Find the perfect beat that resonates with your unique style and take your music to the next level
            </div>
          </div>
        </div>
      </section>

    
    </>
  );
}

export default AboutProducer;
