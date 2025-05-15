import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get userId from the URL
import { db } from "../../firebase/firebase"; // Import Firestore
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "../css/userProfilePage.css"; // Import CSS for styling

const UserProfilePage = () => {
    const { userId } = useParams(); // Get userId from the URL
    const [userInfo, setUserInfo] = useState(null); // State to store user information
    const [activeTab, setActiveTab] = useState("posts"); // State to track the active tab
    const [posts, setPosts] = useState([]); // State to store user posts
    const [tracks, setTracks] = useState([]); // State to store user uploaded tracks

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user information from Firestore
                const userDocRef = doc(db, "beatHubUsers", userId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserInfo({ id: userDoc.id, ...userDoc.data() });
                } else {
                    console.error("User not found.");
                }

                // Fetch user posts from Firestore
                const postsQuery = query(
                    collection(db, "posts"),
                    where("userId", "==", userId),
                    orderBy("createdAt", "desc")
                );
                const postsSnapshot = await getDocs(postsQuery);
                const userPosts = postsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPosts(userPosts);

                // Fetch user uploaded tracks from Firestore
                const tracksQuery = query(
                    collection(db, "beats"),
                    where("userId", "==", userId),
                    orderBy("createdAt", "desc")
                );
                const tracksSnapshot = await getDocs(tracksQuery);
                const userTracks = tracksSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTracks(userTracks);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [userId]);

    if (!userInfo) {
        return <div>Loading user profile...</div>;
    }

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <div className="profile-picture">
                    <img
                        src={userInfo.profilePicture || "default-profile.png"} // Replace with actual profile picture URL or default
                        alt={`${userInfo.username}'s Profile`}
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                </div>
                <div className="profile-info">
                    <h2>{userInfo.username}'s Profile</h2>
                    <p><strong>Is Producer:</strong> {userInfo.IsProducer ? "Yes" : "No"}</p>
                    <p><strong>Joined:</strong> {new Date(userInfo.createdAt.seconds * 1000).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="social-media-links">
                <h3>Connect with {userInfo.username}:</h3>
                <ul>
                    <li>
                        <a href={userInfo.twitter || "#"} target="_blank" rel="noopener noreferrer">
                            Twitter
                        </a>
                    </li>
                    <li>
                        <a href={userInfo.instagram || "#"} target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                    </li>
                    <li>
                        <a href={userInfo.facebook || "#"} target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                    </li>
                </ul>
            </div>

            <div className="profile-tabs">
                <button
                    className={activeTab === "posts" ? "active" : ""}
                    onClick={() => setActiveTab("posts")}
                >
                    Posts
                </button>
                <button
                    className={activeTab === "tracks" ? "active" : ""}
                    onClick={() => setActiveTab("tracks")}
                >
                    Uploaded Tracks
                </button>
            </div>

            <div className="profile-content">
                {activeTab === "posts" && (
                    <div className="posts-tab">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="post-item">
                                    <h3>{post.title}</h3>
                                    <p>{post.content}</p>
                                    <p className="timestamp">
                                        {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No posts available.</p>
                        )}
                    </div>
                )}

                {activeTab === "tracks" && (
                    <div className="tracks-tab">
                        {tracks.length > 0 ? (
                            tracks.map((track) => (
                                <div key={track.id} className="track-item">
                                    <h3>{track.title}</h3>
                                    <audio controls>
                                        <source src={track.url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <p className="timestamp">
                                        {new Date(track.createdAt.seconds * 1000).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No tracks available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
