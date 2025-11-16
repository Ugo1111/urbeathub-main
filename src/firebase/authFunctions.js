// authFunctions.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, /*sendEmailVerification*/ GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import GoogleAuthProvider and signInWithPopup
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { auth, db, /*storage*/ } from "./firebase"; // Ensure Firestore is initialized in firebase.js
//import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";
import axios from "axios"; // Import axios for fetching location

// Sign-Up Function
export const signUp = async (email, password, username, IsProducer, location) => {
  try {
    // Create a user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to Firestore with their username and other details
    await setDoc(doc(db, "beatHubUsers", user.uid), {
      username: username, // Save the username in Firestore
      email: user.email,
      IsProducer: IsProducer, // Save IsProducer in Firestore
      location: location, // Save location in Firestore
      emailVerifyStatus: true, // Assume email is verified
      createdAt: new Date().toISOString(), // Store the timestamp of when the user was created
    });

    console.log("User signed up and added to Firestore:", user.email);

    // Return the user object
    return { user };
  } catch (error) {
    console.error("Sign-Up Error:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

// Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update emailVerifyStatus to true in Firestore
    const userDocRef = doc(db, "beatHubUsers", user.uid);
    await updateDoc(userDocRef, { emailVerifyStatus: true });

    console.log("User logged in:", user.email);
    return userCredential;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error; // Propagate to caller
  }
};

// Logout Function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

// Google Sign-Up/Login Function
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Fetch user's location
    let location = "Unknown";
    try {
      const response = await axios.get("https://ipapi.co/json/");
      const { city, country_name: country } = response.data;
      if (city && country) {
        location = `${city}, ${country}`;
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }

    // Check if the user already exists in Firestore
    const userDocRef = doc(db, "beatHubUsers", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Add the user to Firestore if they don't exist
      await setDoc(userDocRef, {
        username: user.displayName || "Google User",
        email: user.email,
        IsProducer: false, // Default value
        location, // Save fetched location
        emailVerifyStatus: true, // Google accounts are verified by default
        createdAt: new Date().toISOString(),
      });
    }

    console.log("User signed in with Google:", user.email);
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    throw error;
  }
};