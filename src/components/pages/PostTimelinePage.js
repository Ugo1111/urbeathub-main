import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../css/postTimelinePage.css";

const PostTimelinePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postCollectionRef = collection(db, "Post");
        const postSnapshot = await getDocs(postCollectionRef);

        const fetchedPosts = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort posts by timestamp and likes with 3:1 priority for likes
        const sortedPosts = fetchedPosts.sort((a, b) => {
          const likesPriorityA = (a.likesCount || 0) * 3;
          const likesPriorityB = (b.likesCount || 0) * 3;
          const timestampPriorityA = new Date(a.timestamp).getTime();
          const timestampPriorityB = new Date(b.timestamp).getTime();

          return likesPriorityB + timestampPriorityB - (likesPriorityA + timestampPriorityA);
        });

        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post-timeline-page">
      <h1>Post Timeline</h1>
      <div className="post-list">
        {posts.map((post) => (
          <div
            key={post.id}
            className="post-item"
            style={{
              maxWidth: "600px",
              margin: "0 auto 20px auto",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              fontSize: "1.1rem",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              position: "relative",
            }}
          >
            {/* Post Header */}
            <div className="post-header" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <img
                src={post.userProfilePicture || "/default-avatar.png"}
                alt={`${post.username || "User"}'s profile`}
                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px", cursor: "pointer" }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: "bold", cursor: "pointer" }}>
                  {post.username || "Unnamed Artist"}
                </p>
                <p style={{ margin: 0, fontSize: "0.8em", color: "gray" }}>
                  {new Date(post.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p
              style={{ fontSize: "0.9em", marginBottom: "10px", cursor: "pointer" }}
              onClick={() => navigate(`/view-post/${post.id}`)} // Navigate only when clicking on post content
            >
              {post.content}
            </p>
            {post.fileUrl && post.fileType && (
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  backgroundColor: "#f0f0f0",
                  margin: "0 auto 10px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/view-post/${post.id}`)} // Navigate only when clicking on post content
              >
                {post.fileType === "video" ? (
                  <video
                    src={post.fileUrl}
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      display: "block",
                    }}
                  />
                ) : (
                  <img
                    src={post.fileUrl}
                    alt="Post content"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      display: "block",
                    }}
                  />
                )}
              </div>
            )}

            {/* Like and Share Info */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
              <span
                style={{ marginRight: "20px", color: "#db3056", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking like
                  console.log("Like clicked");
                }}
              >
                ❤️ {post.likesCount || 0} Likes
              </span>
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking share
                  console.log("Share clicked");
                }}
              >
                🔗 {post.sharesCount || 0} Shares
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostTimelinePage;
