import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, db } from "../../firebase/firebase"; // Firebase imports
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore imports
import { IoIosContact } from "react-icons/io"; // Icon for default profile picture

function UploadProfilePic({ email }) {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // Store the uploaded image URL
  const [uploading, setUploading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);

  // Fetch the profile picture from Firestore if it exists
  useEffect(() => {
    if (email) {
      fetchProfilePicture(email);
    }
  }, [email]);

  const fetchProfilePicture = async (userEmail) => {
    try {
      const userRef = doc(db, "beatHubUsers", userEmail);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setImageUrl(docSnap.data().profilePicture);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      handleUpload(file);  // Automatically upload the selected file
    }
  };

  const handleUpload = async (file) => {
    if (!file || !email) return;

    setUploading(true);
    const storageRef = ref(storage, `profile-pictures/${email}/profile-pic.jpg`); // Use a fixed name for the profile picture

    // Optionally, delete the old image before uploading the new one (uncomment if needed)
    await deleteOldProfilePic(storageRef);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading image:", error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageUrl(url); // Update the profile picture URL
          saveImageUrlToFirestore(url); // Save the new URL to Firestore
        });
      }
    );
  };

  // Optional: Delete the old profile picture before uploading the new one
  const deleteOldProfilePic = async (storageRef) => {
    try {
      await deleteObject(storageRef);
      console.log("Old profile picture deleted.");
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  };

  const saveImageUrlToFirestore = async (url) => {
    try {
      const userRef = doc(db, "beatHubUsers", email);
      await setDoc(userRef, { profilePicture: url }, { merge: true });
      console.log("Profile picture URL saved to Firestore");
    } catch (error) {
      console.error("Error saving image URL to Firestore:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {loadingImage ? (
        <p>Loading profile picture...</p>
      ) : (
        <>
          {/* Display image or default icon */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <IoIosContact size={200} />
          )}

          {/* File input for image upload */}
          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {uploading && <p>Uploading...</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default UploadProfilePic;