import React, { useRef, useEffect } from "react"; // Import useRef and useEffecteEffect } from "react"; // Import useRef and useEffect
import "../css/component.css"; // Ensure the path is correct for styles
import Typed from "typed.js"; // Import Typed.js for the typing effectimport Typed from "typed.js"; // Import Typed.js for the typing effect

function HeroPage() {
  const typedElement = useRef(null);  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [
        "BeatHub is a Brand That Support Afrobeat Artist",a Brand That Support Afrobeat Artist",
        "Your Next Hit Start Here",t Hit Start Here",
        "Your Sound Your Way: Quality Beats Wey Fit Everyone!", "Your Sound Your Way: Quality Beats Wey Fit Everyone!",
      ],      ],
      typeSpeed: 50,0,
      backSpeed: 30,
      loop: true,loop: true,
    });

    return () => {
      typed.destroy(); // Cleanup Typed.js instance on component unmount.destroy(); // Cleanup Typed.js instance on component unmount
    };
  }, []);

  return (
    <div className="HeroPage">ssName="HeroPage">
      <div>
        <span ref={typedElement}></span> ref={typedElement}></span>
      </div>
      <div className="HeroText"> className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Instrumental Beat.</h1>    <h1>Turn Inspiration into Hits with High-Quality Instrumental Beat.</h1>
        <h5>       <h5>
          Get high quality instrumentals made for artists and creators. Explore          Get high quality instrumentals made for artists and creators. Explore
          Amapiano, Afrobeat, Hip-hop, Trap and AfroFusion beats from topbeat, Hip-hop, Trap and AfroFusion beats from top








export default HeroPage;}  );    </div>      </div>        </h5>          producers. Your next hit starts here.          producers. Your next hit starts here.
        </h5>
      </div>
    </div>
  );
}

export default HeroPage;