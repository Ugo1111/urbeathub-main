import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

function FeedbackForm({ onClose }) {
  const [error, setError] = useState("");
  const [satisfaction, setSatisfaction] = useState(null); // State for satisfaction level

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser; // Get the current user
    const email = user ? user.email : e.target.elements["feedback-email"].value; // Use user's email if logged in
    const message = e.target.elements["feedback-text"].value;

    try {
      const userId = user ? user.uid : "Unregistered New User"; // Use "anonymous" if the user is not logged in
      const isRegisteredUser = !!user; // Boolean indicating if the user is registered

      // Save feedback in the root of Firestore
      const feedbackRef = await addDoc(collection(db, "feedback"), {
        userId, // Add the userId
        email,
        message,
        satisfaction, // Add the satisfaction level
        isRegisteredUser, // Add the field to indicate if the user is registered
        timestamp: new Date(),
      });

      // Save the feedback reference in a subcollection inside the "beatHubUsers" document
      if (user) {
        const userFeedbackCollectionRef = collection(db, "beatHubUsers", userId, "feedbackRefs");
        await addDoc(userFeedbackCollectionRef, {
          feedbackId: feedbackRef.id, // Reference to the feedback document
        });
      }

      alert("Thank you for your feedback!");
      e.target.reset();
      onClose(); // Close the feedback form
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div id="feedback-box">
      <h3>Send us your feedback</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form id="feedback-form" onSubmit={handleFeedbackSubmit}>
        {!auth.currentUser && ( // Show email input only if the user is not signed in
          <input type="email" id="feedback-email" placeholder="Your email" required />
        )}
        <textarea id="feedback-text" placeholder="Your feedback..." rows="3" required />
        
        {/* Satisfaction Level */}
        <div style={{ margin: "10px 0" }}>
          <p>How satisfied are you?</p>
          <div style={{ display: "flex", justifyContent: "space-around", fontSize: "24px" }}>
            <span
              role="img"
              aria-label="Very Dissatisfied"
              onClick={() => setSatisfaction("Very Dissatisfied")}
              style={{
                cursor: "pointer",
                border: satisfaction === "Very Dissatisfied" ? "2px solid red" : "none",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              😡
            </span>
            <span
              role="img"
              aria-label="Dissatisfied"
              onClick={() => setSatisfaction("Dissatisfied")}
              style={{
                cursor: "pointer",
                border: satisfaction === "Dissatisfied" ? "2px solid red" : "none",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              😞
            </span>
            <span
              role="img"
              aria-label="Neutral"
              onClick={() => setSatisfaction("Neutral")}
              style={{
                cursor: "pointer",
                border: satisfaction === "Neutral" ? "2px solid red" : "none",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              😐
            </span>
            <span
              role="img"
              aria-label="Satisfied"
              onClick={() => setSatisfaction("Satisfied")}
              style={{
                cursor: "pointer",
                border: satisfaction === "Satisfied" ? "2px solid red" : "none",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              🙂
            </span>
            <span
              role="img"
              aria-label="Very Satisfied"
              onClick={() => setSatisfaction("Very Satisfied")}
              style={{
                cursor: "pointer",
                border: satisfaction === "Very Satisfied" ? "2px solid red" : "none",
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              😍
            </span>
          </div>
        </div>

        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default FeedbackForm;
