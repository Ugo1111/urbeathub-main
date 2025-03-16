import React, { useState, useEffect } from "react";
import GroupA from "../component/header.js";
import { db } from "../../firebase/firebase"; 
import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";
import SignUp from "../SignUp";
import Login from "../Login";
import Logout from "../logout";
import AuthState from "../AuthState";

const Passage = () => {
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
    <div className="login-form" >
      {/* <h1>Data from Firestore</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul> */}

      {/* <GroupA /> */}
      
    
      <Login />
   

    </div>
  );
};

export default Passage;