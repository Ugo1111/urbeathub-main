import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "Post", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost({ id: postSnap.id, ...postData });

          const userRef = doc(db, "beatHubUsers", postData.userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUser(userSnap.data());
          }

          // Fetch likes count
          const likesRef = collection(postRef, "likes");
          const likesSnapshot = await getDocs(likesRef);
          setLikesCount(likesSnapshot.size);

          // Fetch shares count
          const sharesRef = collection(postRef, "shares");
          const sharesSnapshot = await getDocs(sharesRef);
          setSharesCount(sharesSnapshot.size);
        } else {
          console.error("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  const toggleLikePost = async () => {
    try {
      const postRef = doc(db, "Post", postId);
      const likesRef = collection(postRef, "likes");
      const userLikeRef = doc(likesRef, "currentUserId"); // Replace "currentUserId" with actual user ID

      const userLikeSnap = await getDoc(userLikeRef);

      if (userLikeSnap.exists()) {
        // Unlike the post
        await deleteDoc(userLikeRef);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like the post
        await setDoc(userLikeRef, { userId: "currentUserId", timestamp: new Date().toISOString() }); // Replace "currentUserId" with actual user ID
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSharePost = async () => {
    try {
      const postRef = doc(db, "Post", postId);
      const sharesRef = collection(postRef, "shares");
      const userShareRef = doc(sharesRef, "currentUserId"); // Replace "currentUserId" with actual user ID

      const userShareSnap = await getDoc(userShareRef);

      if (!userShareSnap.exists()) {
        // Save the share
        await setDoc(userShareRef, { userId: "currentUserId", timestamp: new Date().toISOString() }); // Replace "currentUserId" with actual user ID
        setSharesCount((prev) => prev + 1);
      }

      // Share the post link
      const shareUrl = `${window.location.origin}/post/${postId}`;
      if (navigator.share) {
        navigator.share({
          title: "Post from BeatHub",
          text: `Check out this post: ${shareUrl}`,
          url: shareUrl,
        }).catch((error) => console.error("Error sharing post:", error));
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert("Post link copied to clipboard!");
        }).catch((error) => console.error("Error copying link:", error));
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  return (
    <div className="post-page">
      {post && user ? (
        <div
          className="post-item"
          style={{
            margin: "20px auto",
            maxWidth: "600px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <div className="post-header" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt={`${user.username}'s profile`}
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: "bold" }}>{user.username || "Unnamed Artist"}</p>
              <p style={{ margin: 0, fontSize: "0.8em", color: "gray" }}>
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p style={{ fontSize: "0.9em", marginBottom: "10px" }}>{post.content}</p>
          {post.fileUrl && post.fileType && (
            <div style={{ marginBottom: "10px" }}>
              {post.fileType === "video" ? (
                <video
                  src={post.fileUrl}
                  controls
                  width="100%"
                  preload="none"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              ) : (
                <img
                  src={post.fileUrl}
                  alt="Post content"
                  width="100%"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              )}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
            <button
              onClick={toggleLikePost}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#db3056",
                cursor: "pointer",
              }}
            >
              ❤️ {likesCount} Likes
            </button>
            <button
              onClick={handleSharePost}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
              }}
            >
              🔗 {sharesCount} Shares
            </button>
          </div>
        </div>
      ) : (
        <p>Loading post...</p>
      )}
    </div>
  );
};

export default PostPage;
