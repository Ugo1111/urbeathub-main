import React, { useRef, useEffect } from "react"; // Import useRef and useEffecteEffect } from "react"; // Import useRef and useEffect
import "../css/component.css"; // Ensure the path is correct for styles
import Typed from "typed.js"; // Import Typed.js for the typing effectimport Typed from "typed.js"; // Import Typed.js for the typing effect

function HeroPage() {
<<<<<<< HEAD
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

=======
>>>>>>> parent of e8750f9 (Resolved merge conflicts)
  return (
    <div className="HeroPage">ssName="HeroPage">
      <div>
        <span ref={typedElement}></span> ref={typedElement}></span>
      </div>
<<<<<<< HEAD
      <div className="HeroText"> className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Instrumental Beat.</h1>    <h1>Turn Inspiration into Hits with High-Quality Instrumental Beat.</h1>
        <h5>       <h5>
          Get high quality instrumentals made for artists and creators. Explore          Get high quality instrumentals made for artists and creators. Explore
          Amapiano, Afrobeat, Hip-hop, Trap and AfroFusion beats from topbeat, Hip-hop, Trap and AfroFusion beats from top








export default HeroPage;}  );    </div>      </div>        </h5>          producers. Your next hit starts here.          producers. Your next hit starts here.
=======
      <div className="HeroText">
        <h1>Turn Inspiration into Hits with High-Quality Afrobeat Instrumental.</h1>
        <h5>
        Get high quality Afrobeat instrumentals made for artists and creators. Explore Amapiano and AfroFusion beats from top producers. Your next hit starts here.
>>>>>>> parent of e8750f9 (Resolved merge conflicts)
        </h5>
      </div>
    </div>
  );
}

export default HeroPage;