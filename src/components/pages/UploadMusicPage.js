import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase.js"; 
import { collection, getDocs } from "firebase/firestore"; 
import { AuthState } from "../AuthState.js";
import Logout from "../logout.js";
import UploadMusicComponent from "../component/UploadMusicComponent.js";
import UploadedMusicComponent from "../component/UploadedMusicComponent.js";

const UploadMusicPage = ({ email }) => {
  const [data, setData] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "lee"));
      const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Data from Firestore</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.first} {item.last}</li> 
        ))}
      </ul>

      <AuthState />
      <Logout />
      <UploadMusicComponent
        selectedMusic={selectedMusic}
        clearSelection={() => setSelectedMusic(null)}
      />
      <UploadedMusicComponent setSelectedMusic={setSelectedMusic} />
    </div>
  );
};

export default UploadMusicPage;