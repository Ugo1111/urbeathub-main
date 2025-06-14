import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting
import "../css/viewPostPage.css";

const ViewPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "Post", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost(postSnap.data());
        } else {
          console.error("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <div className="view-post-page">
      <button
        onClick={() => navigate(-1)} // Navigate back to the previous page
        style={{
          backgroundColor: "#db3056",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 15px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Back
      </button>
      <div className="post-container">
        <h1>{post.content}</h1>
        <p style={{ fontSize: "0.8em", color: "gray" }}>
          Posted {formatTimestamp(post.timestamp)}
        </p>
        {post.fileUrl && post.fileType === "image" && (
          <img
            src={post.fileUrl}
            alt="Post content"
            style={{ display: "block", margin: "20px auto", maxWidth: "100%", height: "50vh" }}
          />
        )}
        {post.fileUrl && post.fileType === "video" && (
          <video
            src={post.fileUrl}
            controls
            muted
            controlsList="nodownload nofullscreen noplaybackrate" // Disable fullscreen and other controls
            disablePictureInPicture // Disable Picture-in-Picture mode
            style={{ display: "block", margin: "20px auto", maxWidth: "100%" }}
          />
        )}
      </div>
    </div>
  
  );
};

export default ViewPostPage;
