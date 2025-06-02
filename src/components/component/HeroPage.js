import React, { useRef, useEffect } from "react"; // Import useRef and useEffect
import "../css/component.css"; // Ensure the path is correct for styles
import Typed from "typed.js"; // Import Typed.js for the typing effect

function HeroPage() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [
        "Ur BeatHub is a Brand That Support African Artist",
        "Your Next Hit Start Here",
        "Your Sound Your Way: Quality Beats Wey Fit Everyone!",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    });

    return () => {
      typed.destroy(); // Cleanup Typed.js instance on component unmount
    };
  }, []);

  return (
    <div className="HeroPage">
      <div>
        <span className="Typed" ref={typedElement}></span>
      </div>
      <div className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Instrumental.</h1>
        <h5>
          Get high quality instrumental beats made for artists and creators. Explore Amapiano, Afrobeat, Pop, Reggaeton and Trap beats from top producers. Your next hit starts here.
        </h5>
      </div>
    </div>
  );
}

function ProducersHeroPage() {
  return (
    <div className="HeroPageProducer">
      <div className="HeroText">
        <h5>Official website of #producer</h5>
        <h1>Shaping the sound of modern African music</h1>
      </div>
    </div>
  );
}

// Ensure named exports for both components
export { HeroPage, ProducersHeroPage };