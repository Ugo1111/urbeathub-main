import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase.js"; 
import { collection, getDocs } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged } from "firebase/auth"; // To get auth state
import { AuthState } from "../AuthState.js";
import Logout from "../logout.js";
import UploadMusicComponent from "../component/UploadMusicComponent.js";
import UploadedMusicComponent from "../component/UploadedMusicComponent.js";

const AdminPage = ({ email }) => {
  const [data, setData] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [userId, setUserId] = useState(null); // To store user ID
  const [isAdmin, setIsAdmin] = useState(false); // To store admin status
  const [loading, setLoading] = useState(true); // To track loading state

  useEffect(() => {
    // Fetch data from Firestore
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "beats"));
      const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items);
    };

    fetchData();

    // Listen to auth state changes to get the latest user and claims
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setUserId(user.uid); // Set user ID
        
        try {
          // Force refresh the token to get the latest claims
          const idTokenResult = await user.getIdTokenResult(true); // true forces a refresh
          
          // Check if the user has the 'admin' claim
          if (idTokenResult.claims.admin) {
            setIsAdmin(true); // User is an admin
          } else {
            setIsAdmin(false); // User is not an admin
          }
        } catch (error) {
          console.error("Error fetching ID token:", error);
        }
      } else {
        setUserId(null); // No user logged in
        setIsAdmin(false); // Reset admin status
      }

      setLoading(false); // Set loading to false once the check is done
    });

    // Cleanup listener when component is unmounted
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while checking user status
  }

  // If the user is not an admin, show an error message
  if (!isAdmin) {
    return <div>You are not an admin. You cannot access this page.</div>;
  }

  return (
    <div>
      <h1>Data from Firestore</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.first} {item.last}</li> 
        ))}
      </ul>

      {/* Display the user ID and admin status */}
      {userId && <p>Your user ID: {userId}</p>}
      {isAdmin && <p>You are an admin!</p>}

      <AuthState />
      <Logout />
      {/* <UploadMusicComponent
        selectedMusic={selectedMusic}
        clearSelection={() => setSelectedMusic(null)}
      /> */}
      <UploadedMusicComponent setSelectedMusic={setSelectedMusic} />
    </div>
  );
};

export default AdminPage;