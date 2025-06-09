import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for human-friendly dates
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/adminUsersPage.css"; // Import CSS for styling

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]); // State to store users
  const [lastVisible, setLastVisible] = useState(null); // State to track the last visible document
  const [loading, setLoading] = useState(false); // State to track loading status
  const [hasMore, setHasMore] = useState(true); // State to track if more users are available
  const [totalUsers, setTotalUsers] = useState(0); // State to store the total number of users
  const [expandedUsers, setExpandedUsers] = useState({}); // State to track expanded user details
  const navigate = useNavigate(); // Initialize navigate function

  const fetchUsers = async (loadMore = false) => {
    if (loading || (loadMore && !hasMore)) return; // Prevent duplicate fetches
    setLoading(true);

    try {
      const usersQuery = loadMore
        ? query(collection(db, "beatHubUsers"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(20))
        : query(collection(db, "beatHubUsers"), orderBy("createdAt", "desc"), limit(20));

      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers((prevUsers) => (loadMore ? [...prevUsers, ...usersData] : usersData));
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update the last visible document
      setHasMore(querySnapshot.docs.length === 20); // Check if there are more users to load

      // Fetch the total number of users
      if (!loadMore) {
        const totalUsersSnapshot = await getDocs(collection(db, "beatHubUsers"));
        setTotalUsers(totalUsersSnapshot.size); // Set the total number of users
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch initial users on component mount
  }, []);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      fetchUsers(true); // Load more users when the user scrolls near the bottom
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
  }, [lastVisible, hasMore]);

  const toggleExpandUser = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId], // Toggle the expanded state for the user
    }));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true }); // Use date-fns to format the date
  };

  return (
    <div className="admin-users-page">
      <h2>All Users</h2>
      <p><strong>Total Users:</strong> {totalUsers}</p> {/* Display the total number of users */}
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <p><strong>Username:</strong> {user.username || "N/A"}</p>
              <p><strong>Created:</strong> {user.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
              <p><strong>Location:</strong> {user.location || "Unknown"}</p> {/* Display location */}
              <button onClick={() => toggleExpandUser(user.id)}>
                {expandedUsers[user.id] ? "Show Less" : "Show More"}
              </button>
              {expandedUsers[user.id] && (
                <div className="user-details">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email || "N/A"}</p>
                  <p><strong>Email Verified:</strong> {user.emailVerifyStatus ? "Yes" : "No"}</p>
                  <p><strong>Is Producer:</strong> {user.IsProducer ? "Yes" : "No"}</p>
                  <button
                    onClick={() => navigate(`/profile/${user.id}`)} // Navigate to profile page
                    className="view-profile-button"
                  >
                    View Profile
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available.</p>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default AdminUsersPage;
