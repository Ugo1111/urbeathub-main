import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase"; // Firestore and Auth import
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";


function ProducerMessages() {
  const [topics, setTopics] = useState([]); // List of topics for the current user
  const [selectedTopic, setSelectedTopic] = useState(null); // Topic selected by the user
  const [message, setMessage] = useState(""); // The new message the user will send
  const [messages, setMessages] = useState([]); // Messages under the selected topic
  const [error, setError] = useState(""); // Error message for invalid input
  const [newTopicName, setNewTopicName] = useState(""); // New topic name for creating a new message

  // Load topics for the logged-in user from Firestore
  useEffect(() => {
    const user = auth.currentUser; // Get the current user

    if (user) {
      // Firestore listener to fetch the topics for this user
      const unsubscribe = onSnapshot(
        collection(db, "beatHubUsers", user.uid, "messages"),
        (querySnapshot) => {
          const topicsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTopics(topicsList); // Set the list of topics for the user
        }
      );
      return () => unsubscribe(); // Cleanup on unmount
    }
  }, []);

  // Load messages under the selected topic
  useEffect(() => {
    if (selectedTopic) {
      const user = auth.currentUser; // Get the current user
      const messagesQuery = query(
        collection(db, "beatHubUsers", user.uid, "messages", selectedTopic, "messages"),
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

  // Handle new topic creation
  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      setError("Please provide a name for the new topic!");
      return;
    }

    const user = auth.currentUser; // Get the current user
    if (user) {
      try {
        // Create a new topic
        const topicRef = await addDoc(collection(db, "beatHubUsers", user.uid, "messages"), {
          name: newTopicName.trim(),
        });

        // After creating a new topic, select it and start the conversation
        setSelectedTopic(topicRef.id);
        setNewTopicName(""); // Clear the input
        setError(""); // Clear any error messages
      } catch (err) {
        console.error("Error creating new topic: ", err);
        setError("Error creating new topic. Please try again.");
      }
    }
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
      const user = auth.currentUser; // Get the current user
      if (user && selectedTopic) {
        // Create a timestamp
        const timestamp = new Date(); 

        // Add the message to Firestore under the selected topic
        await addDoc(
          collection(db, "beatHubUsers", user.uid, "messages", selectedTopic, "messages"),
          {
            senderId: user.uid, // The sender of the message
            message: message.trim(), // The content of the message
            timestamp, // Timestamp of the message
          }
        );

        // Update the last updated time for the topic with the message timestamp
        await updateDoc(doc(db, "beatHubUsers", user.uid, "messages", selectedTopic), {
          messageLastUpdated: timestamp,
        });

        // Update the last updated time for the user
        await updateDoc(doc(db, "beatHubUsers", user.uid), {
          messageLastUpdated: timestamp,
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
    <>
    <Helmet>
      <title>Producer Messages | Ur Beathub</title>
    </Helmet>
    <div className="producermessage-body">
      <div className="producermessage-container">
        <h2>Message Admin</h2>

        {/* Error handling */}
        {error && <p className="producermessage-error-message">{error}</p>}

        {/* Topic Selection */}
        {!selectedTopic && (
          <div className="producermessage-topic-selection">
            <h3>Select or Start a New Topic</h3>

            {topics.length > 0 ? (
              <>
                <ul>
                  {topics.map((topic) => (
                    <li
                      key={topic.id}
                      className={selectedTopic === topic.id ? "producermessage-selected" : ""}
                      onClick={() => handleTopicSelect(topic.id)}
                    >
                      {topic.name}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setSelectedTopic(null)}>Start a New Message</button>
              </>
            ) : (
              <p>No topics available. Please start a new message below.</p>
            )}
          </div>
        )}

        {/* Back to topics button */}
        {selectedTopic && (
          <button className="producermessage-back-to-topics" onClick={handleBackToTopics}>
            Back to Topics
          </button>
        )}

        {/* If no topic is selected, show the option to create a new topic */}
        {!selectedTopic && (
          <div className="producermessage-new-topic-form">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Enter topic name"
              required
            />
            <button onClick={handleCreateNewTopic}>Create New Topic</button>
          </div>
        )}

        {/* Display messages under selected topic */}
        {selectedTopic && (
          <div className="producermessage-message-list">
            <h3>Messages in {topics.find((topic) => topic.id === selectedTopic)?.name}</h3>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="producermessage-message-item">
                  <p>
                    <strong>{msg.senderId === auth.currentUser?.uid ? "You" : "Admin"}:</strong> {msg.message}
                  </p>
                  <p className="producermessage-timestamp">
                    {new Date(msg.timestamp.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No messages yet. Be the first to start the conversation!</p>
            )}
          </div>
        )}

        {/* Message input form */}
        {selectedTopic && (
          <form onSubmit={handleSubmit} className="producermessage-message-form">
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
    </div>
    </>
  );
}

export default ProducerMessages;