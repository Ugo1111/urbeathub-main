import { useEffect, useState } from "react";
import '../css/component.css';
import { useNavigate } from 'react-router-dom';
import GroupA from "../component/header.js";
import { GroupF, GroupG } from "../component/footer";
import RecomendationComponent from "../component/recomendationComponent";
import FeedbackForm from "../component/FeedbackForm"; // Import FeedbackForm
import { Helmet } from 'react-helmet';


const sound = "/images/prdoucer studio.jpg";
const Art = "/images/Urbeathub art.jpg";
const Mixer = "/images/Mixer.jpg";
const myVideo = "/images/new video.mp4"; // Correct path for public assets


function Front() {
  const navigate = useNavigate();
 
   const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChatOptions = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const toggleFeedbackForm = () => {
    setIsFormOpen(!isFormOpen);
  };


  return (
    <>
      <Helmet>
     <title>High Quality Instrumental Beats for Sale | UrBeatHub</title>
        <meta name="google-site-verification" content="K0fOZTnTt94pq3xFMMzzOFU7DYpQGUG0F7Mv2zq8F8I" />
        <meta
          name="description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta property="og:title" content="High Quality Instrumental Beats for Sale | UrBeatHub" />
        <meta
          property="og:description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta property="og:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
        <meta property="og:url" content="https://urbeathub.com" /> 
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="High Quality Instrumental Beats for Sale | UrBeatHub" />
        <meta
          name="twitter:description"
          content="Discover high quality instrumental beats for artists, ready for your next hit. Browse exclusive and royalty-free beats with instant download and licensing."
        />
        <meta name="twitter:image" content="https://urbeathub.com/ur_beathub_og_image_1200x630.png" />
      </Helmet>
      <GroupA />
      <div className="video-wrap">
        <video src={myVideo} autoPlay muted loop></video>
        <div className="video-content">
          <h1>Buy premium beats made by the world’s top producers.</h1>
          <p>Discover the latest beats that are making waves in the music scene.</p>
          <button className="start-selling-button" onClick={() => navigate('/Homepage')}>
            GET STARTED →
          </button>
        </div>
      </div>

<div className="trending">
  <div className="trending-wrapper">
    <div className="trending-container">
 <h2>Trending Beats</h2>
    </div>
   <div className="trending-container">
 <a href="/Homepage">see more</a>
     </div>
    </div>
  <RecomendationComponent />
  
</div>
    <div className="distribute">
      <div className="distribute-wrapper">
        
        <div className="distribute-container">
          <h2>Sell high quality instrumental beats with ease.</h2>
<p>Monetize your talent—start earning real cash from the beats you create.</p>
          <button className="start-selling-button" onClick={() => navigate('/signUpPage')}>GET STARTED →</ button>
        </div>

        <div className="distribute-container">
          <img src={sound} alt="Sound Packs" className="packs" />
        </div>
</div>
    </div>

    <section className="hero2-1">
        <div className="hero2-overlay"></div>
        <div className="hero2-wrapper">
          <div className="hero2-container">
            <img src={Mixer} alt="Mixer" className="mixer" /> 
          </div>
          <div className="hero2-container1">
            <h2>Explore Our Collection of High-Quality <br></br>Instrumentals, for Every Genre and Mood</h2>
            <ul>
              <li>Dive into a world of exceptional instrumentals carefully crafted to elevate your music</li>
              <li>Whether you're seeking the perfect beat for a new track or a signature sound for your next project, our collection has you covered</li>
              <li>Simple licensing options. Our contracts are not confusing. Spend less time scratching your head and more time recording your next hit.</li>
          <li>Find the perfect beat that resonates with your unique style and take your music to the next level</li>
            </ul>
          </div>
        </div>
      </section>
      

     <div className="graphics">
      <div className="graphics-wrapper">
        
        <div className="graphics-container">
        <img src={Art} alt="Sound Packs" className="packs" />
        </div>

        <div className="graphics-container">
        <h2>Be Your Own <span className="Graphics-art">Graphic Designer</span></h2>
          <p>Create your Cover Art with Layouts, Images, Presets, Filters, Fonts, and Overlays</p>
          <button className="start-selling-button" onClick={() => navigate('/signUpPage')}>Sign up →</button> 
        </div>

      </div>
    </div>
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
          <button className="start-selling-button" onClick={() => navigate('/startsellingpage')}>Start Selling →</button>
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
   
    <GroupF />
    <GroupG />
    

    {/* WhatsApp Chat Button */}
      <div id="whatsapp-chat" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <button
          onClick={toggleChatOptions}
          style={{
            backgroundColor: "#db3056",
            color: "white",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "30px",
            textAlign: "center",
            lineHeight: "60px",
            border: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          💬
        </button>

        {/* Chat options (hidden/show dynamically) */}
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              padding: "10px",
              textAlign: "center",
              position: "absolute",
              bottom: 70,
              right: 0,
              width: "200px",
            }}
          >
            <p style={{ margin: 0, color: "black" }}>Chat with:</p>
            <a href="https://wa.me/447776727121?text=Hi%20I%20need%20help%20with%20your%20services" target="_blank" rel="noopener noreferrer">
              <button style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}>
                Lee
              </button>
            </a>
            or
            <a href="https://wa.me/2347011886514?text=Hi%20I%20need%20help%20with%20your%20services" target="_blank" rel="noopener noreferrer">
              <button style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}>
                Tayexy
              </button>
            </a>
          </div>
        )}
      </div>
         {/* Feedback Form Button */}
      <button className="vertical-feedback-btn" onClick={toggleFeedbackForm}>
        FEEDBACK
      </button>

      {/* Feedback Form */}
      {isFormOpen && <FeedbackForm onClose={toggleFeedbackForm} />}
  
    </>
  );
}

export default Front;
