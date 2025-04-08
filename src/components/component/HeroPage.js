import React from "react";
import "../css/component.css"; // Ensure the path is correct for styles
import { useEffect, useRef } from "react";
import Typed from "typed.js";

function HeroPage() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: ["BeatHub is a Brand That Support Afrobeat Artist", "Your Next Hit Start Here", "Connect With Artist WorldWide"],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <div className="HeroPage">
      <div>
       <span ref={typedElement}></span>
      </div>
      <div className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Afrobeat Instrumental.</h1>
        <h5>
        Get high quality Afrobeat instrumentals made for artists and creators. Explore Amapiano and AfroFusion beats from top producers. Your next hit starts here.
        </h5>
      </div>
    </div>
  );
}



export default HeroPage;

      