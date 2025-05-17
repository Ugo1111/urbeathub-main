import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebase"; // Import Firebase
import { collection, query, where, getDocs, doc } from "firebase/firestore"; // Firestore functions
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { Helmet } from 'react-helmet';
import FeedbackForm from "../component/FeedbackForm"; // Import FeedbackForm

const DashboardComponent = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalTracks: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPlays: 0,
    beatsSold: 0,
    earnings: 0,
  });

  // Fetch current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserBeats(currentUser.uid); // Fetch data once user is authenticated
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's beats from Firestore
  const fetchUserBeats = async (userId) => {
    try {
      // Query beats where userId matches the current user's UID
      const beatsQuery = query(collection(db, "beats"), where("userId", "==", userId));
      const beatsSnapshot = await getDocs(beatsQuery);

      let totalTracks = 0,
        totalLikes = 0,
        totalComments = 0,
        totalPlays = 0,
        beatsSold = 0,
        earnings = 0;

      for (const beatDoc of beatsSnapshot.docs) {
        const beat = beatDoc.data();
        const beatId = beatDoc.id;

        totalTracks += 1;
        totalPlays += beat.plays || 0;

        // 🔥 Fetch likes count from subcollection
        const likesRef = collection(db, "beats", beatId, "likes");
        const likesSnapshot = await getDocs(likesRef);
        totalLikes += likesSnapshot.size;

        // 🔥 Fetch comments count from subcollection
        const commentsRef = collection(db, "beats", beatId, "comments");
        const commentsSnapshot = await getDocs(commentsRef);
        totalComments += commentsSnapshot.size;

        // 🔥 Calculate sales and earnings
        if (beat.sold || (beat.sales && beat.sales.length > 0)) {
          beatsSold += beat.sales?.length || 1; // Count number of sales
          earnings += beat.sales?.reduce((sum, sale) => sum + (sale.price || 0), 0) || beat.price || 0;
        }
      }

      setDashboardData({
        totalTracks,
        totalLikes,
        totalComments,
        totalPlays,
        beatsSold,
        earnings,
      });
    } catch (error) {
      console.error("Error fetching beats:", error);
    }
  };
  const [isChatOpen, setIsChatOpen] = useState(false);

const toggleChatOptions = () => {
  setIsChatOpen(!isChatOpen);
};

const [isFormOpen, setIsFormOpen] = useState(false);

const toggleFeedbackForm = () => {
  setIsFormOpen(!isFormOpen);
};

  return (
    <div>
    <Helmet>
    <title>Dashboard | Ur Beathub</title>
  </Helmet>
    <div className="dashboard-body">
    <div className="dashboard-container">
      <h1>Performance Dashboard</h1>

      {!user ? (
        <p>Loading user data...</p>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-box">
            <h3>Total Tracks</h3>
            <p>{dashboardData.totalTracks}</p>
          </div>

          <div className="stat-box">
            <h3>Total Likes</h3>
            <p>{dashboardData.totalLikes}</p>
          </div>

          <div className="stat-box">
            <h3>Total Comments</h3>
            <p>{dashboardData.totalComments}</p>
          </div>

          {/* <div className="stat-box">
            <h3>Total Plays</h3>
            <p>{dashboardData.totalPlays}</p>
          </div> */}

          <div className="stat-box">
            <h3>Beats Sold</h3>
            <p>{dashboardData.beatsSold}</p>
          </div>

          <div className="stat-box">
            <h3>Total Earnings</h3>
            <p>${dashboardData.earnings.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
    </div>
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
            <a href="https://wa.me/2347039426515?text=Hi%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
              <button style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}>
                Tayexy 
              </button>
            </a>
            or
            <a href="https://wa.me/2347011886514?text=Hi%20I%20need%20help%20with%20your%20services" target="_blank" rel="noopener noreferrer">
              <button style={{ backgroundColor: "#db3056", color: "white", padding: "10px", borderRadius: "5px", margin: "5px" }}>
                Lee
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
  </div>
)}
  
  

export default DashboardComponent;