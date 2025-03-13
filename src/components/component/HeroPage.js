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
        <h3>We are Africa's sound producer for Africans.</h3>
        <h5>
          Get your already made AFRO, AMAh5IANO instrumental beats from
          producers – perfect for artists and creators. Your Next Hit Starts
          here.
        </h5>
      </div>
    </div>
  );
}



export default HeroPage;

      