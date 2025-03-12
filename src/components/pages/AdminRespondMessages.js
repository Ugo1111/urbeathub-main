import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Firestore import
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";

function AdminRespondMessages() {
  const [topics, setTopics] = useState([]); // List of topics
  const [selectedTopic, setSelectedTopic] = useState(null); // Selected topic
  const [message, setMessage] = useState(""); // New message to send
  const [messages, setMessages] = useState([]); // Messages under the selected topic
  const [error, setError] = useState(""); // Error message for invalid input

  // Load topics from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "beatHubUsers"),
      (querySnapshot) => {
        const topicsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicsList); // Set the list of topics
      }
    );
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Load messages under the selected topic
  useEffect(() => {
    if (selectedTopic) {
      const messagesQuery = query(
        collection(db, "beatHubUsers", selectedTopic, "messages"),
        orderBy("timestamp", "asc")
      );

      // Firestore listener to fetch messages for the selected topic
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const topicMessages = querySnapshot.docs.map((doc) => doc.data());
        setMessages(topicMessages); // Set messages for the selected topic
      });

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [selectedTopic]);

  // Handle topic selection
  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId); // Set the selected topic
    setMessages([]); // Clear existing messages when switching topics
  };

  // Handle message input change
  const handleChange = (e) => {
    setMessage(e.target.value); // Update the message input field
  };

  // Handle form submission to send the message
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a message!"); // If no message is entered
      return;
    }

    try {
      if (selectedTopic) {
        // Add the message to Firestore under the selected topic
        await addDoc(collection(db, "beatHubUsers", selectedTopic, "messages"), {
          senderId: "admin", // The sender of the message
          message: message.trim(), // The content of the message
          timestamp: new Date(), // Timestamp of the message
        });

        setMessage(""); // Clear the input field after submission
        setError(""); // Clear any existing error messages
      }
    } catch (err) {
      setError("Error sending message. Please try again."); // If an error occurs during submission
      console.error(err);
    }
  };

  // Handle the back to topics view
  const handleBackToTopics = () => {
    setSelectedTopic(null); // Reset selected topic to null to show topic list
  };

  return (
    <div className="admin-respond-messages">
      <h2>Respond to User Messages</h2>

      {/* Error handling */}
      {error && <p className="error-message">{error}</p>}

      {/* Topic Selection */}
      {!selectedTopic && (
        <div className="topic-selection">
          <h3>Select a Topic</h3>

          {topics.length > 0 ? (
            <ul>
              {topics.map((topic) => (
                <li
                  key={topic.id}
                  className={selectedTopic === topic.id ? "selecteds" : "selecteds"}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  {topic.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No topics available.</p>
          )}
        </div>
      )}

      {/* Back to topics button */}
      {selectedTopic && (
        <button className="back-to-topics" onClick={handleBackToTopics}>
          Back to Topics
        </button>
      )}

      {/* Display messages under selected topic */}
      {selectedTopic && (
        <div className="message-list">
          <h3>Messages in {topics.find((topic) => topic.id === selectedTopic)?.name}</h3>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="message-item">
                <p>
                  <strong>{msg.senderId === "admin" ? "Admin" : "User"}:</strong> {msg.message}
                </p>
                <p className="timestamp">{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
      )}

      {/* Message input form */}
      {selectedTopic && (
        <form onSubmit={handleSubmit} className="message-form">
          <textarea
            value={message}
            onChange={handleChange}
            placeholder="Write a message..."
            rows="4"
            required
          ></textarea>
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
}

export default AdminRespondMessages;
