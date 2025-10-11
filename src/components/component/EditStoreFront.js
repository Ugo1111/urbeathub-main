import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase"; // Import Firestore and Auth
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "../css/MusicDistributionForm.css";
import { Helmet } from 'react-helmet-async';

const EditStoreFront = () => {
  const [brandName, setBrandName] = useState("");
  const [aboutProducer, setAboutProducer] = useState("");
  const [studioImage, setStudioImage] = useState(null);
  const [storeTitle1, setStoreTitle1] = useState("");
  const [storeTitle2, setStoreTitle2] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    const fetchStoreFrontData = async () => {
      try {
        const user = auth.currentUser; // Get the logged-in user
        if (!user) return;

        const userDocRef = doc(db, "beatHubUsers", user.uid, "store front", "details");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setBrandName(data.brandName || "");
          setAboutProducer(data.aboutProducer || "");
          setStudioImage(data.studioImage || null);
          setStoreTitle1(data.storeTitle1 || "");
          setStoreTitle2(data.storeTitle2 || "");
        }
      } catch (error) {
        console.error("Error fetching store front data:", error);
      }
    };

    fetchStoreFrontData();
  }, []);

  const handleStudioImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setStudioImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser; // Get the logged-in user
      if (!user) {
        alert("You must be logged in to save changes.");
        return;
      }

      const storeFrontData = {
        brandName,
        aboutProducer,
        studioImage,
        storeTitle1,
        storeTitle2,
      };

      const userDocRef = doc(db, "beatHubUsers", user.uid, "store front", "details");
      await setDoc(userDocRef, storeFrontData);

      alert("Store front changes saved!");
    } catch (error) {
      console.error("Error saving store front data:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleViewStore = () => {
    const user = auth.currentUser; // Get the logged-in user
    if (!user) {
      alert("You must be logged in to view the store.");
      return;
    }
    const storeUrl = `/store/${user.uid}`;
    window.open(storeUrl, "_blank"); // Open store page in a new tab
  };

  const handleViewProfile = () => {
    const user = auth.currentUser;
    if (!user) {
      alert("you must be logged in to view proile.");
      return;
    }
      const profileUrl = `/profile/${user.uid}`;
      window.open(profileUrl, "_blank");
    
  };

  return (
    <>
    <Helmet>
          <title>Edit Store</title>
        </Helmet>
    <div className="edit-store-front-container">
    <div className="edit-store-front">
      <h2>Edit Store Front</h2>
      <div className="form-group">
        <label>Brand Name</label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter brand name"
        />
      </div>
      <div className="form-group">
        <label>About the Producer</label>
        <textarea
          value={aboutProducer}
          onChange={(e) => setAboutProducer(e.target.value)}
          placeholder="Write a short bio about yourself or the brand"
        />
      </div>
      <div className="form-group">
        <label>Studio Image</label>
        <p style={{ fontSize: "0.9em", color: "#666" }}>Upload your studio or branding image</p>
        <input type="file" accept="image/*" onChange={handleStudioImageChange} />
        {studioImage && (
          <img
            src={studioImage}
            alt="Studio Preview"
            style={{ maxWidth: "300px", maxHeight: "200px", marginTop: "10px", objectFit: "cover" }} // Adjusted size
          />
        )}
      </div>
      <div className="form-group">
        <label>Store Title 1</label>
        <input
          type="text"
          value={storeTitle1}
          onChange={(e) => setStoreTitle1(e.target.value)}
          placeholder="Enter store title 1"
        />
      </div>
      <div className="form-group">
        <label>Store Title 2</label>
        <input
          type="text"
          value={storeTitle2}
          onChange={(e) => setStoreTitle2(e.target.value)}
          placeholder="Enter store title 2"
        />
      </div>
      <button className="store-btn" onClick={handleSaveChanges} >
        Save Changes
      </button>
      <button  className="store-btn1" onClick={handleViewStore} >
        View Store
      </button>
      <button  className="store-btn1" onClick={handleViewProfile} >
        View Profile
      </button>
    </div>
    </div>
    </>
  );
};

export default EditStoreFront;
