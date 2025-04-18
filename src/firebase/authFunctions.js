// authFunctions.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth"; // Import sendEmailVerification
import { doc, setDoc, updateDoc } from "firebase/firestore"; // Import updateDoc for Firestore updates
import { auth, db, storage } from "./firebase"; // Ensure Firestore is initialized in firebase.js
import { collection, getDocs } from "firebase/firestore"; // Correct import from Firebase SDKimport SignUp from "./components/SignUp";

// Function to map Firebase error codes to user-friendly messages
const getFriendlyErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already in use. Please use a different email or log in.",
    "auth/weak-password": "Your password is too weak. Please use at least 6 characters.",
    "auth/invalid-email": "The email address is invalid. Please enter a valid email.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "The password you entered is incorrect. Please try again.",
    "auth/email-not-verified": "A verification email was sent to your email address. Please verify your email before logging in.", // New case
    // Add more error codes and messages as needed
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please check your details and try again.";
};

// Sign-Up Function
export const signUp = async (email, password, username, IsProducer) => {
  try {
    // Create a user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add the user to Firestore with their username and other details
    await setDoc(doc(db, "beatHubUsers", user.uid), {
      username: username, // Save the username in Firestore
      email: user.email,
      IsProducer: IsProducer, // Save IsProducer in Firestore
      emailVerifyStatus: false, // Set initial verification status
      createdAt: new Date().toISOString(), // Store the timestamp of when the user was created
    });

    // Send email verification
    await sendEmailVerification(user);
    console.log("Verification email sent to:", user.email);

    return {
      user,
      requiresVerification: true
    };
  } catch (error) {
    console.error("Sign-Up Error:", error.message);
    throw new Error(getFriendlyErrorMessage(error.code)); // Use friendly error message
  }
};

// Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      const error = new Error("Please verify your email address before logging in.");
      error.code = "auth/email-not-verified";
      throw error;
    }

    // Update emailVerifyStatus to true in Firestore
    const userDocRef = doc(db, "beatHubUsers", user.uid);
    await updateDoc(userDocRef, { emailVerifyStatus: true });

    console.log("User logged in and verification status updated:", user.email);
    return userCredential;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw new Error(getFriendlyErrorMessage(error.code)); // Use friendly error message
  }
};

// Logout Function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("", error.message);
  }
};