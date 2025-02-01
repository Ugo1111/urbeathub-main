import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; 
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import GroupA from "../component/header.js";
import UploadProfilePic from "../component/UploadProfilePic.js";  // Import the upload component

function ProfilePage() {
  const [last, setLast] = useState("");
  const [first, setFirst] = useState("");
  const [born, setBorn] = useState(""); 
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [isNew, setIsNew] = useState(true); 

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);  // Set email once user is authenticated
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    if (email) {
      const fetchData = async () => {
        try {
          const docSnap = await getDoc(doc(db, "beatHubUsers", email));

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Document data:", data);

            setLast(data.last || "");
            setFirst(data.first || "");
            setBorn(data.born || "");
            setJob(data.job || "");
            setIsNew(false);
          } else {
            console.log("No document found, ready to create a new one.");
            setIsNew(true);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      };

      fetchData();
    }
  }, [email]);

  const handleSubmit = async () => {
    if (!email) {
      console.error("Email is not set, cannot save data.");
      return;
    }

    try {
      const docRef = doc(db, "beatHubUsers", email);
      const data = {
        first,
        last,
        born,
        job,
        timestamp: serverTimestamp(),
      };

      if (isNew) {
        await setDoc(docRef, data);
        console.log("Document successfully created!");
      } else {
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully updated!");
      }
    } catch (e) {
      console.error("Error saving/updating document:", e);
    }
  };

  return (
    <>
      <GroupA />
    <div className="ProfilePage">
      <h1>{isNew ? "Complete Your Profile" : "UPDATE Your Profile"}</h1>
      
      {/* Upload Profile Picture Component */}
      {email && <UploadProfilePic email={email} />}


      <input
        value={last}
        type="text"
        placeholder="Last Name"
        onChange={(e) => setLast(e.target.value)}
      />
      <input
        value={first}
        type="text"
        placeholder="First Name"
        onChange={(e) => setFirst(e.target.value)}
      />
      <input
        value={born}
        type="date"
        placeholder="Born Date"
        onChange={(e) => setBorn(e.target.value)}
      />
      <input
        value={job}
        type="text"
        placeholder="Job"
        onChange={(e) => setJob(e.target.value)}
      />
      <button onClick={handleSubmit}>
        {isNew ? "Create Data" : "Update Data"}
      </button>

    </div></>
  );
}

export default ProfilePage;