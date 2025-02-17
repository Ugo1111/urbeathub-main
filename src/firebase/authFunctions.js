// authFunctions.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "./firebase"; // Ensure Firestore is initialized in firebase.js
import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";


// Sign-Up Function
export const signUp = async (email, password, username) => {
  try {
    // Create a user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to Firestore with their username and other details
    await setDoc(doc(db, "beatHubUsers", user.uid), {
      username: username,  // Save the username in Firestore
      email: user.email,
      createdAt: new Date().toISOString(),  // Store the timestamp of when the user was created
    });

    console.log("User signed up and added to Firestore:", user.email);
    return user;  // Return the user object after successful sign-up

  } catch (error) {
    console.error("Sign-Up Error:", error.message);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


// Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
  } catch (error) {
    console.error("Login Error:", error.message);
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