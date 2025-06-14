import React, { useState, useEffect } from "react";
import "../css/component.css";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaShare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const shuffleArray = (array) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const HomePageFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postCollectionRef = collection(db, "Post");
        const postSnapshot = await getDocs(postCollectionRef);
        const allPosts = await Promise.all(
          postSnapshot.docs.map(async (docSnap) => {
            const postData = docSnap.data();

            let userName = "Unknown User";
            let userProfilePic = "";

            try {
              const userRef = doc(db, "users", postData.userId);
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const userData = userSnap.data();
                userName = userData.name || "Unknown User";
                userProfilePic = userData.profilePic || "";
              }
            } catch (err) {
              console.error("Error fetching user data:", err);
            }

            return {
              id: docSnap.id,
              ...postData,
              userName,
              userProfilePic,
            };
          })
        );

        const shuffledPosts = shuffleArray(allPosts);
        setPosts(shuffledPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="post-card-container">
      <div style={{ padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Post From Our Community</h2>

        <div className="feed-scroll-container">
          {posts.slice(0, 4).map((post) => (
            <div key={post.id} className="post-card">
              {/* User Info */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <img
                  src={post.userProfilePic || "/images/Mixer.jpg"}
                  alt="Profile"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginRight: "10px",
                    objectFit: "cover",
                  }}
                />
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{post.userName}</span>
              </div>

              {/* Post Content */}
              <p style={{ marginBottom: "10px", fontSize: "14px", color: "#fff" }}>{post.content}</p>

              {/* Display Image or Video */}
              {post.fileUrl && post.fileType === "image" && (
                <img
                  src={post.fileUrl}
                  alt="Post"
                  style={{
                    width: "100%",
                    maxHeight: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
              )}
              {post.fileUrl && post.fileType === "video" && (
                <video
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "180px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <source src={post.fileUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "gray", fontSize: "0.8em" }}>
                  {post.timestamp
                    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
                    : "Just now"}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <FaHeart style={{ cursor: "pointer" }} />
                  <FaShare style={{ cursor: "pointer" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered View All Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button className="view-post" onClick={() => navigate("/post-timeline")}>
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePageFeed;
