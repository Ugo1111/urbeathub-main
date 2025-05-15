// authFunctions.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth"; // Import sendEmailVerification
import { doc, setDoc, updateDoc } from "firebase/firestore"; // Import updateDoc for Firestore updates
import { auth, db, storage } from "./firebase"; // Ensure Firestore is initialized in firebase.js
import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";

// Sign-Up Function
export const signUp = async (email, password, username, IsProducer) => { // Add IsProducer as a parameter
  try {
    // Create a user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to Firestore with their username and other details
    await setDoc(doc(db, "beatHubUsers", user.uid), {
      username: username,  // Save the username in Firestore
      email: user.email,
      IsProducer: IsProducer, // Save IsProducer in Firestore
      emailVerifyStatus: false, // Set initial verification status
      createdAt: new Date().toISOString(),  // Store the timestamp of when the user was created
    });

    // Send email verification
    await sendEmailVerification(user);
    console.log("Verification email sent to:", user.email);

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
    const user = userCredential.user;

    if (!user.emailVerified) {
      // Immediately sign the user out if email not verified
      await signOut(auth);
      throw new Error("Please verify your email address before logging in.");
    }

    // Update emailVerifyStatus to true in Firestore
    const userDocRef = doc(db, "beatHubUsers", user.uid);
    await updateDoc(userDocRef, { emailVerifyStatus: true });

    console.log("User logged in and verification status updated:", user.email);
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