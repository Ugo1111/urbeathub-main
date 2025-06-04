import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore"; // Add missing import for getDocs
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting timestamps
import { FaHeart, FaShareAlt } from "react-icons/fa"; // Import icons for like and share
import "../css/postPage.css"; // Add CSS for styling
import { auth } from "../../firebase/firebase"; // Import Firebase Auth

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate for redirection
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "Post", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost(postData);

          // Fetch user details
          const userRef = doc(db, "beatHubUsers", postData.userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUser(userSnap.data());
          }

          // Fetch likes count
          const likesRef = collection(postRef, "likes");
          const likesSnapshot = await getDocs(likesRef);
          setLikesCount(likesSnapshot.size);

          // Check if current user has liked the post
          if (currentUser) {
            const userLikeRef = doc(likesRef, currentUser.uid);
            const userLikeSnap = await getDoc(userLikeRef);
            setIsLiked(userLikeSnap.exists());
          }
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
  }, [postId, currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async () => {
    if (!currentUser) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Hide notification after 3 seconds
      return;
    }

    try {
      const postRef = doc(db, "Post", postId);
      const likesRef = collection(postRef, "likes");
      const userLikeRef = doc(likesRef, currentUser.uid);

      if (isLiked) {
        await deleteDoc(userLikeRef);
        setLikesCount((prev) => prev - 1);
        setIsLiked(false);
      } else {
        await setDoc(userLikeRef, { userId: currentUser.uid, timestamp: new Date().toISOString() });
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator.share({
        title: "Post from BeatHub",
        text: `Check out this post: ${post.content || "Amazing content!"}`,
        url: shareUrl,
      }).catch((error) => console.error("Error sharing post:", error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Post link copied to clipboard!");
      }).catch((error) => console.error("Error copying link:", error));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <div className="post-page">
      {showNotification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src="/beathub1.PNG"
            alt="Beathub Logo"
            style={{ width: "40px", height: "40px", marginRight: "10px" }}
          />
          <span>Please log in to like this post.</span>
        </div>
      )}
      <div className="post-container">
        {/* Post Header */}
        <div
          className="post-header"
          style={{ display: "flex", alignItems: "center", marginBottom: "10px", cursor: "pointer" }}
          onClick={() => navigate(`/profile/${post.userId}`)} // Use post.userId instead of user?.id
        >
          <img
            src={user?.profilePicture || "/default-avatar.png"}
            alt={`${user?.username || "User"}'s profile`}
            style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>{user?.username || "Unnamed Artist"}</p>
            <p style={{ margin: 0, fontSize: "0.8em", color: "gray" }}>
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <p style={{ fontSize: "0.9em", marginBottom: "10px" }}>{post.content}</p>
        {post.fileUrl && post.fileType === "image" && (
          <img
            src={post.fileUrl}
            alt="Post content"
            style={{ display: "block", margin: "20px auto", maxWidth: "100%", borderRadius: "8px" }}
          />
        )}
        {post.fileUrl && post.fileType === "video" && (
          <video
            src={post.fileUrl}
            controls
            style={{ display: "block", margin: "20px auto", maxWidth: "100%", borderRadius: "8px" }}
          />
        )}

        {/* Like and Share Buttons */}
        <div style={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
          <button
            onClick={handleLike}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <FaHeart size="1.5em" color={isLiked ? "red" : "gray"} />
            <span style={{ marginLeft: "5px" }}>{likesCount} Likes</span>
          </button>
          <button
            onClick={handleShare}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaShareAlt size="1.5em" color="#007bff" />
            <span style={{ marginLeft: "5px" }}>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
