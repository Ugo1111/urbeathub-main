import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Firestore import
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp, doc, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for relative time formatting
import "../css/adminRespondMessages.css"; 
function AdminRespondMessages() {
  const [users, setUsers] = useState([]); // List of users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered list of users
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [selectedUser, setSelectedUser] = useState(null); // Selected user
  const [topics, setTopics] = useState([]); // List of topics for the selected user
  const [selectedTopic, setSelectedTopic] = useState(null); // Selected topic
  const [message, setMessage] = useState(""); // New message to send
  const [messages, setMessages] = useState([]); // Messages under the selected topic
  const [error, setError] = useState(""); // Error message for invalid input
  const [newMessages, setNewMessages] = useState({}); // New messages indicator

  // Load users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "beatHubUsers"),
      async (querySnapshot) => {
        const usersList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const userData = { id: doc.id, ...doc.data() };

            // Check if the user has unread messages
            const topicsQuery = collection(db, "beatHubUsers", userData.id, "messages");
            const topicsSnapshot = await getDocs(topicsQuery);

            const hasUnread = await Promise.all(
              topicsSnapshot.docs.map(async (topicDoc) => {
                const topicMessagesQuery = collection(
                  db,
                  "beatHubUsers",
                  userData.id,
                  "messages",
                  topicDoc.id,
                  "messages"
                );
                const messagesSnapshot = await getDocs(topicMessagesQuery);
                return messagesSnapshot.docs.some(
                  (msgDoc) => !msgDoc.data().read && msgDoc.data().senderId !== "admin"
                );
              })
            );

            userData.hasUnread = hasUnread.some((unread) => unread); // Add `hasUnread` flag
            return userData;
          })
        );

        // Sort users by the timestamp of their latest message or topic update
        usersList.sort((a, b) => {
          const aLatestUpdate = a.messageLastUpdated?.seconds || 0;
          const bLatestUpdate = b.messageLastUpdated?.seconds || 0;
          return bLatestUpdate - aLatestUpdate;
        });

        setUsers(usersList); // Set the list of users
        setFilteredUsers(usersList); // Initialize filtered users
      }
    );
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Load topics for the selected user
  useEffect(() => {
    if (selectedUser) {
      const topicsQuery = collection(db, "beatHubUsers", selectedUser, "messages");

      // Firestore listener to fetch topics for the selected user
      const unsubscribe = onSnapshot(topicsQuery, (querySnapshot) => {
        const userTopics = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(userTopics); // Set topics for the selected user

        // Check for new messages
        const newMessagesIndicator = {};
        userTopics.forEach((topic) => {
          const topicMessagesQuery = collection(db, "beatHubUsers", selectedUser, "messages", topic.id, "messages");
          getDocs(topicMessagesQuery).then((querySnapshot) => {
            const hasUnread = querySnapshot.docs.some(
              (doc) => !doc.data().read && doc.data().senderId !== "admin"
            );
            if (hasUnread) {
              newMessagesIndicator[topic.id] = true;
            }
            setNewMessages(newMessagesIndicator);
          });
        });
      });

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [selectedUser]);

  // Load messages under the selected topic
  useEffect(() => {
    if (selectedTopic) {
      const messagesQuery = query(
        collection(db, "beatHubUsers", selectedUser, "messages", selectedTopic, "messages"),
        orderBy("timestamp", "asc")
      );

      // Firestore listener to fetch messages for the selected topic
      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const topicMessages = querySnapshot.docs.map((doc) => doc.data());
        setMessages(topicMessages); // Set messages for the selected topic

        // Scroll to the bottom of the message list
        setTimeout(() => {
          const messageList = document.querySelector(".message-list");
          if (messageList) {
            messageList.scrollTop = messageList.scrollHeight;
          }
        }, 100);
      });

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [selectedUser, selectedTopic]);

  // Handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUser(userId); // Set the selected user
    setSelectedTopic(null); // Reset selected topic
    setMessages([]); // Clear existing messages when switching users
  };

  // Handle topic selection
  const handleTopicSelect = async (topicId) => {
    setSelectedTopic(topicId); // Set the selected topic
    setMessages([]); // Clear existing messages when switching topics

    try {
      // Fetch messages for the selected topic
      const topicMessagesQuery = collection(db, "beatHubUsers", selectedUser, "messages", topicId, "messages");
      const querySnapshot = await getDocs(topicMessagesQuery);

      querySnapshot.forEach(async (doc) => {
        const messageData = doc.data();
        if (!messageData.read && messageData.senderId !== "admin") {
          // Mark the message as read in Firestore
          await updateDoc(doc.ref, { read: true });
        }
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
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
      if (selectedUser && selectedTopic) {
        // Add the message to Firestore under the selected topic
        await addDoc(collection(db, "beatHubUsers", selectedUser, "messages", selectedTopic, "messages"), {
          senderId: "admin", // The sender of the message
          message: message.trim(), // The content of the message
          timestamp: new Date(), // Timestamp of the message
          read: false, // Mark the message as unread for the producer
        });

        // Update the last updated time for the topic
        await updateDoc(doc(db, "beatHubUsers", selectedUser, "messages", selectedTopic), {
          messageLastUpdated: serverTimestamp(),
        });

        // Update the last updated time for the user
        await updateDoc(doc(db, "beatHubUsers", selectedUser), {
          messageLastUpdated: serverTimestamp(),
        });

        setMessage(""); // Clear the input field after submission
        setError(""); // Clear any existing error messages
      }
    } catch (err) {
      setError("Error sending message. Please try again."); // If an error occurs during submission
      console.error(err);
    }
  };

  // Handle the back to users view
  const handleBackToUsers = () => {
    setSelectedUser(null); // Reset selected user to null to show user list
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

      {/* Search box */}
      <input
        type="text"
        placeholder="Search by email or username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {/* User Selection */}
      {!selectedUser && (
        <div className="user-selection">
          <h3>Select a User</h3>

          {filteredUsers.length > 0 ? (
            <ul>
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className={selectedUser === user.id ? "selected" : ""}
                  onClick={() => handleUserSelect(user.id)}
                >
                  {user.name || user.email} {/* Display user name or email */}
                  <span className="timestamp">
                    {user.messageLastUpdated
                      ? ` (${formatDistanceToNow(new Date(user.messageLastUpdated.seconds * 1000), {
                          addSuffix: true,
                        })})`
                      : ""}
                  </span>
                  {user.hasUnread && (
                    <>
                      <span className="new-message-indicator">New</span> {/* Add new message indicator */}
                      <span className="new-message-dot"></span> {/* Add new message dot */}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No users available.</p>
          )}
        </div>
      )}

      {/* Back to users button */}
      {selectedUser && !selectedTopic && (
        <button className="back-to-users" onClick={handleBackToUsers}>
          Back to Users
        </button>
      )}

      {/* Topic Selection */}
      {selectedUser && !selectedTopic && (
        <div className="topic-selection">
          <h3>Select a Topic</h3>

          {topics.length > 0 ? (
            <ul>
              {topics.map((topic) => (
                <li
                  key={topic.id}
                  className={selectedTopic === topic.id ? "selected" : ""}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  {topic.name}
                  <span className="timestamp">
                    {topic.messageLastUpdated ? ` (${formatDistanceToNow(new Date(topic.messageLastUpdated.seconds * 1000), { addSuffix: true })})` : ""}
                  </span>
                  {newMessages[topic.id] && (
                    <>
                      <span className="new-message-indicator">New</span> {/* Add new message indicator */}
                      <span className="new-message-dot"></span> {/* Add new message dot */}
                    </>
                  )}
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