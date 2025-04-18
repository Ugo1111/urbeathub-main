import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebase"; // Import Firebase
import { collection, query, where, getDocs, doc } from "firebase/firestore"; // Firestore functions
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { Helmet } from 'react-helmet';

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
    </div>
  );
};

export default DashboardComponent;