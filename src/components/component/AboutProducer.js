import React, { useState, useEffect } from "react";
import "../css/component.css";
import { db, auth } from "../../firebase/firebase"; // Import Firestore and Auth
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom"; // Import useParams for dynamic userId

function AboutProducer() {
  const [studioImage, setStudioImage] = useState("");
  const [aboutProducer, setAboutProducer] = useState("");
  const [brandName, setBrandName] = useState("");
  const { userId } = useParams(); // Get userId from URL parameters

  useEffect(() => {
    const fetchProducerData = async () => {
      try {
        const targetUserId = userId || auth.currentUser?.uid; // Use userId from URL or logged-in user
        if (!targetUserId) return;

        const userDocRef = doc(db, "beatHubUsers", targetUserId, "store front", "details");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setStudioImage(data.studioImage || "/images/Mixer.jpg"); // Fallback to default image
          setAboutProducer(data.aboutProducer || ""); // Fetch aboutProducer dynamically
          setBrandName(data.brandName || ""); // Fetch brandName dynamically
        }
      } catch (error) {
        console.error("Error fetching producer data:", error);
      }
    };

    fetchProducerData();
  }, [userId]);

  return (
    <>
      <section className="hero2">
        <div className="hero2-overlay"></div>
        <div className="hero2-wrapper">
          <div className="hero2-container">
            <img
              src={studioImage || "/images/Mixer.jpg"} // Fallback to Mixer.jpg
              alt="Studio"
              className="mixer"
            /> {/* Dynamic studio image */}
          </div>
          <div className="hero2-container1">
            <h2>About {brandName}</h2> {/* Dynamic brand name */}
            <div>
              {aboutProducer || "Passionate music producer blending innovative beats with authentic storytelling. Known for genre versatility, dynamic soundscapes, and emotive rhythms."}
            </div> {/* Dynamic aboutProducer text with fallback */}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutProducer;
