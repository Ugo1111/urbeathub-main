import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import GroupA from "../component/header.js";
import UploadProfilePic from "../component/UploadProfilePic.js";  // Import the upload component

function ProfilePage() {
  const [last, setLast] = useState("");
  const [first, setFirst] = useState("");
  const [biography, setBiography] = useState("");  // New biography field
  const [location, setLocation] = useState("");  // New location field
  const [username, setUsername] = useState("");  // To manage the username
  const [email, setEmail] = useState("");
  const [isNew, setIsNew] = useState(true); 
  const [successMessage, setSuccessMessage] = useState("");  // Success message state

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
            setBiography(data.biography || "");  // Fetch biography data
            setLocation(data.location || "");    // Fetch location data
            setUsername(data.username || "");    // Fetch username data
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
        biography,
        location,
        username,  // Save the updated username
        timestamp: serverTimestamp(),
      };

      if (isNew) {
        await setDoc(docRef, data);
        console.log("Document successfully created!");
      } else {
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully updated!");
      }

      // Show success message and hide after 3 seconds
      setSuccessMessage(isNew ? "Profile created successfully!" : "Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");  // Clear message after 3 seconds
      }, 3000);

    } catch (e) {
      console.error("Error saving/updating document:", e);
    }
  };

  // Handle username change from the editable div
  const handleUsernameChange = (e) => {
    setUsername(e.target.innerText);
  };

  return (
    <>
      <GroupA />
      <div className="ProfilePage">
        <h1>{isNew ? "Complete Your Profile" : "UPDATE Your Profile"}</h1>
        <div className="ProfilePage-userName-container">
          {/* Upload Profile Picture Component */}
          {email && <UploadProfilePic email={email} />}

          {/* Display username directly and make it editable */}
          <div className="ProfilePage-userName-Username">
            <label>Display name</label>
            <h2
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleUsernameChange}
              dangerouslySetInnerHTML={{ __html: username || "Username" }}
            />
          </div>
        </div>

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

        {/* Biography text area with label */}
        <div className="bio-container">
          <label htmlFor="biography" className="bio-label">Biography</label>
          <textarea
            id="biography"
            className="bio-textarea"
            value={biography}
            placeholder="Write your biography"
            onChange={(e) => setBiography(e.target.value)}
          />
        </div>

        <input
          value={location}
          type="text"
          placeholder="📍Location"
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSubmit}>
          {isNew ? "Create Data" : "Update Data"}
        </button>

        {/* Success message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </div>


    </>
  );
}

export default ProfilePage;