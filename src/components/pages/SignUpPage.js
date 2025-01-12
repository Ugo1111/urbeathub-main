import React, { useState, useEffect } from "react";
import GroupA from "../component/header.js";
import { db } from "../../firebase/firebase.js"; 
import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";
import SignUp from "../SignUp.js";
import Login from "../Login.js";

import AuthState from "../AuthState.js";

const Enroll = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "beat"));
      const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* <h1>Data from Firestore</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul> */}

      
     
      <SignUp />
      
     

    </div>
  );
};

export default Enroll;