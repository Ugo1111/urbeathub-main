// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Example for Firestore
import { getAuth } from "firebase/auth"; // Example for Auth
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8W--BS_6CLcxH7A7Of-oKkWDXIRFc4zs",
  authDomain: "beathub-4e595.firebaseapp.com",
  projectId: "beathub-4e595",
  storageBucket: "beathub-4e595.firebasestorage.app",
  messagingSenderId: "463972934206",
  appId: "1:463972934206:web:6acd07f839bbba4d30676f",
  measurementId: "G-CQEF4ZG6RH"
};



const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
 const storage = getStorage(app); // Initialize Firebase Storage

export { app, db, auth, storage };