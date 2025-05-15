import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for human-friendly dates
import "../css/adminFeedbackPage.css"; // Import CSS for styling

const AdminFeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]); // State to store feedback
  const [lastVisible, setLastVisible] = useState(null); // State to track the last visible document
  const [loading, setLoading] = useState(false); // State to track loading status
  const [hasMore, setHasMore] = useState(true); // State to track if more feedback is available
  const [expandedFeedback, setExpandedFeedback] = useState({}); // State to track expanded feedback details

  const fetchFeedback = async (loadMore = false) => {
    if (loading || (loadMore && !hasMore)) return; // Prevent duplicate fetches
    setLoading(true);

    try {
      const feedbackQuery = loadMore
        ? query(collection(db, "feedback"), orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20))
        : query(collection(db, "feedback"), orderBy("timestamp", "desc"), limit(20));

      const querySnapshot = await getDocs(feedbackQuery);
      const feedbackData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFeedbackList((prevFeedback) => (loadMore ? [...prevFeedback, ...feedbackData] : feedbackData));
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update the last visible document
      setHasMore(querySnapshot.docs.length === 20); // Check if there are more feedback items to load
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(); // Fetch initial feedback on component mount
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      fetchFeedback(true); // Load more feedback when the user scrolls near the bottom
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
  }, [lastVisible, hasMore]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to JavaScript Date
    return formatDistanceToNow(date, { addSuffix: true }); // Use date-fns to format the date
  };

  const toggleExpandFeedback = (feedbackId) => {
    setExpandedFeedback((prev) => ({
      ...prev,
      [feedbackId]: !prev[feedbackId], // Toggle the expanded state for the feedback
    }));
  };

  return (
    <div className="admin-feedback-page">
      <h2>User Feedback</h2>
      {feedbackList.length > 0 ? (
        <ul>
          {feedbackList.map((feedback) => (
            <li key={feedback.id} className="feedback-item">
              <p><strong>Email:</strong> {feedback.email}</p>
              <p><strong>Timestamp:</strong> {feedback.timestamp ? formatDate(feedback.timestamp) : "N/A"}</p>
              <button onClick={() => toggleExpandFeedback(feedback.id)}>
                {expandedFeedback[feedback.id] ? "Show Less" : "Show More"}
              </button>
              {expandedFeedback[feedback.id] && (
                <div className="feedback-details">
                  <p><strong>User ID:</strong> {feedback.userId}</p>
                  <p><strong>Message:</strong> {feedback.message}</p>
                  <p><strong>Satisfaction:</strong> {feedback.satisfaction}</p>
                  <p><strong>Registered User:</strong> {feedback.isRegisteredUser ? "Yes" : "No"}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No feedback available.</p>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default AdminFeedbackPage;
