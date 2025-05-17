import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import GroupA from "../component/header.js";
import UploadProfilePic from "../component/UploadProfilePic.js";  // Import the upload component

function ProfileSettingContent({ uid, isNew, last, first, biography, location, username, setLast, setFirst, setBiography, setLocation, setUsername, handleSubmit, successMessage }) {
  return (
    <form className="ProfilePage" onSubmit={handleSubmit}> {/* Wrap content in a form */}
      <h1>{isNew ? "Complete Your Profile" : "UPDATE Your Profile"}</h1>
      <div className="ProfilePage-userName-container">
        {uid && <UploadProfilePic uid={uid} />}

        <div className="ProfilePage-userName-Username">
          <label>Display name</label>
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)} // Controlled input
          />
        </div>
      </div>
      <br />
      <label>Last Name</label>
      <input
        value={last}
        type="text"
        placeholder="Last Name"
        onChange={(e) => setLast(e.target.value)}
      />

      <label>First Name</label>
      <input
        value={first}
        type="text"
        placeholder="First Name"
        onChange={(e) => setFirst(e.target.value)}
      />

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

      <br />
      <label>📍Location🎯</label>
      <input
        value={location}
        type="text"
        placeholder="📍Location"
        onChange={(e) => setLocation(e.target.value)}
      />
      <button type="submit"> {/* Ensure button type is submit */}
        {isNew ? "Create Data" : "Update Data"}
      </button>

      {successMessage && <div className="success-message">{successMessage}</div>}
    </form>
  );
}

function ProfileSettingPage() {
  const [last, setLast] = useState("");
  const [first, setFirst] = useState("");
  const [biography, setBiography] = useState("");
  const [location, setLocation] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.email); // Debugging log
        setEmail(user.email);
        setUid(user.uid);
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const fetchData = async () => {
        try {
          console.log("Fetching data for UID:", uid); // Debugging log
          const docSnap = await getDoc(doc(db, "beatHubUsers", uid));

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Document data:", data);

            setLast(data.last || "");
            setFirst(data.first || "");
            setBiography(data.biography || "");
            setLocation(data.location || "");
            setUsername(data.username || "");
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
  }, [uid]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!uid) {
      console.error("UID is not set, cannot save data.");
      return;
    }

    try {
      console.log("Submitting data for UID:", uid); // Debugging log
      const docRef = doc(db, "beatHubUsers", uid);
      const data = {
        first,
        last,
        biography,
        location,
        username,
        timestamp: serverTimestamp(),
      };

      if (isNew) {
        await setDoc(docRef, data);
        console.log("Document successfully created!");
      } else {
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully updated!");
      }

      setSuccessMessage(isNew ? "Profile created successfully!" : "Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (e) {
      console.error("Error saving/updating document:", e);
    }
  };

  return (
    <>
      <GroupA />
      <ProfileSettingContent
        uid={uid}
        isNew={isNew}
        last={last}
        first={first}
        biography={biography}
        location={location}
        username={username}
        setLast={setLast}
        setFirst={setFirst}
        setBiography={setBiography}
        setLocation={setLocation}
        setUsername={setUsername}
        handleSubmit={handleSubmit}
        successMessage={successMessage}
      />
    </>
  );
}

function ProfileSettingPageWithoutHeaderForDashboardPage() {
  const [last, setLast] = useState("");
  const [first, setFirst] = useState("");
  const [biography, setBiography] = useState("");
  const [location, setLocation] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.email); // Debugging log
        setEmail(user.email);
        setUid(user.uid);
      } else {
        console.error("No authenticated user found");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const fetchData = async () => {
        try {
          console.log("Fetching data for UID:", uid); // Debugging log
          const docSnap = await getDoc(doc(db, "beatHubUsers", uid));

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Document data:", data);

            setLast(data.last || "");
            setFirst(data.first || "");
            setBiography(data.biography || "");
            setLocation(data.location || "");
            setUsername(data.username || "");
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
  }, [uid]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!uid) {
      console.error("UID is not set, cannot save data.");
      return;
    }

    try {
      console.log("Submitting data for UID:", uid); // Debugging log
      const docRef = doc(db, "beatHubUsers", uid);
      const data = {
        first,
        last,
        biography,
        location,
        username,
        timestamp: serverTimestamp(),
      };

      if (isNew) {
        await setDoc(docRef, data);
        console.log("Document successfully created!");
      } else {
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully updated!");
      }

      setSuccessMessage(isNew ? "Profile created successfully!" : "Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (e) {
      console.error("Error saving/updating document:", e);
    }
  };

  return (
    <ProfileSettingContent
      uid={uid}
      isNew={isNew}
      last={last}
      first={first}
      biography={biography}
      location={location}
      username={username}
      setLast={setLast}
      setFirst={setFirst}
      setBiography={setBiography}
      setLocation={setLocation}
      setUsername={setUsername}
      handleSubmit={handleSubmit}
      successMessage={successMessage}
    />
  );
}

export { ProfileSettingPage, ProfileSettingPageWithoutHeaderForDashboardPage };
