import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase"; // Import Firebase Auth
import "../css/userProfilePage.css";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting timestamps
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { SlOptionsVertical } from "react-icons/sl"; // Import three-dot icon
import { ToastContainer, toast } from "react-toastify";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Store logged-in user details
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0); // State for post count
  const [isPostModalOpen, setIsPostModalOpen] = useState(false); // State for post modal
  const [postContent, setPostContent] = useState(""); // State for post content
  const [postFile, setPostFile] = useState(null); // State for uploaded file
  const [posts, setPosts] = useState([]); // State for posts
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [activePostOptions, setActivePostOptions] = useState(null); // State to track active post options

  const togglePostModal = () => {
    setIsPostModalOpen((prevState) => !prevState); // Toggle modal state
    if (!isPostModalOpen) {
      const modalElement = document.querySelector(".post-modal"); // Select the modal element
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: "smooth", block: "center" }); // Scroll to the modal
      }
    }
  };

  const togglePostOptions = (postId) => {
    setActivePostOptions((prev) => (prev === postId ? null : postId)); // Toggle active post options
  };

  const toggleLikePost = async (postId) => {
    if (!currentUser) {
      alert("Please log in to like a post.");
      navigate("/loginPage");
      return;
    }

    try {
      const postRef = doc(db, "Post", postId);
      const likesRef = collection(postRef, "likes");
      const userLikeRef = doc(likesRef, currentUser.uid);

      const userLikeSnap = await getDoc(userLikeRef);

      if (userLikeSnap.exists()) {
        // Unlike the post
        await deleteDoc(userLikeRef);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likesCount: (post.likesCount || 0) - 1 } : post
          )
        );
      } else {
        // Like the post
        await setDoc(userLikeRef, { userId: currentUser.uid, timestamp: new Date().toISOString() });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likesCount: (post.likesCount || 0) + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to toggle like. Please try again.");
    }
  };

  const handleSharePost = async (postId) => {
    if (!currentUser) {
      alert("Please log in to share a post.");
      navigate("/loginPage");
      return;
    }

    try {
      const postRef = doc(db, "Post", postId);
      const sharesRef = collection(postRef, "shares");
      const userShareRef = doc(sharesRef, currentUser.uid);

      const userShareSnap = await getDoc(userShareRef);

      if (!userShareSnap.exists()) {
        // Save the share
        await setDoc(userShareRef, { userId: currentUser.uid, timestamp: new Date().toISOString() });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, sharesCount: (post.sharesCount || 0) + 1 } : post
          )
        );
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
      alert("Failed to share post. Please try again.");
    }
  };

  useEffect(() => {
    // Fetch the logged-in user's details
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser) {
        setCurrentUser({ uid: loggedInUser.uid, email: loggedInUser.email });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const fetchUserById = async (id) => {
      const userRef = doc(db, "beatHubUsers", id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() };

        // Check if the logged-in user is already following this user
        const socialRef = doc(db, "Social", id);
        const socialSnap = await getDoc(socialRef);

        if (socialSnap.exists()) {
          const followers = socialSnap.data().followers || [];
          const following = socialSnap.data().following || [];
          userData.isFollowing = currentUser ? followers.includes(currentUser.uid) : false;
          setFollowersCount(followers.length);
          setFollowingCount(following.length);
        } else {
          setFollowersCount(0);
          setFollowingCount(0);
        }

        // Fetch post count from the user's subcollection
        const userPostRef = collection(db, `beatHubUsers/${id}/post`);
        const postSnapshot = await getDocs(userPostRef);
        setPostCount(postSnapshot.size); // Update post count from subcollection

        // Fetch posts from the "Post" collection
        const postCollectionRef = collection(db, "Post");
        const postSnapshotFromPostCollection = await getDocs(postCollectionRef);
        const userPosts = postSnapshotFromPostCollection.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => post.userId === id); // Filter posts by userId
        setPosts(userPosts);

        setUser(userData);
      } else {
        console.log("User not found");
      }
    };

    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, currentUser]);

  const ensureSocialDocumentExists = async (userId) => {
    const socialRef = doc(db, "Social", userId);
    const socialSnap = await getDoc(socialRef);

    if (!socialSnap.exists()) {
      await setDoc(socialRef, {
        followers: [],
        following: [],
      });
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert("Please log in to follow this user.");
      navigate("/loginPage"); // Redirect to login page
      return;
    }

    try {
      await ensureSocialDocumentExists(userId);
      await ensureSocialDocumentExists(currentUser.uid);

      const socialRef = doc(db, "Social", userId);
      const currentUserSocialRef = doc(db, "Social", currentUser.uid);

      // Update followers for the target user
      await updateDoc(socialRef, {
        followers: arrayUnion(currentUser.uid),
      });

      // Update following for the current user
      await updateDoc(currentUserSocialRef, {
        following: arrayUnion(userId),
      });

      setFollowersCount((prev) => prev + 1);

      setUser((prevUser) => ({
        ...prevUser,
        isFollowing: true,
      }));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) {
      alert("Please log in to unfollow this user.");
      navigate("/loginPage"); // Redirect to login page
      return;
    }

    try {
      const socialRef = doc(db, "Social", userId);
      const currentUserSocialRef = doc(db, "Social", currentUser.uid);

      // Remove followers for the target user
      await updateDoc(socialRef, {
        followers: arrayRemove(currentUser.uid),
      });

      // Remove following for the current user
      await updateDoc(currentUserSocialRef, {
        following: arrayRemove(userId),
      });

      setFollowersCount((prev) => prev - 1);

      setUser((prevUser) => ({
        ...prevUser,
        isFollowing: false,
      }));
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const handlePostSubmit = async () => {
    if (!currentUser) {
      alert("Please log in to create a post.");
      navigate("/loginPage");
      return;
    }

    try {
      const storage = getStorage(); // Initialize Firebase Storage
      let fileUrl = null;
      let fileType = null;

      if (postFile) {
        const storageRef = ref(storage, `posts/${currentUser.uid}/${postFile.name}`); // Create a reference in Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, postFile); // Create a resumable upload task

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update progress state
          },
          (error) => {
            console.error("Error uploading file:", error);
            alert("Failed to upload file. Please try again.");
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref); // Get the public download URL
            fileType = postFile.type.startsWith("video") ? "video" : "image"; // Determine file type

            const postCollectionRef = collection(db, "Post");
            const newPost = {
              userId: currentUser.uid,
              content: postContent,
              fileUrl, // Use the public download URL
              fileType, // Save the file type
              timestamp: new Date().toISOString(),
            };

            const postDocRef = await addDoc(postCollectionRef, newPost);

            // Save a reference to the post in the user's subcollection
            const userPostRef = collection(db, `beatHubUsers/${currentUser.uid}/post`);
            await setDoc(doc(userPostRef, postDocRef.id), {
              postId: postDocRef.id,
              timestamp: newPost.timestamp,
            });

            toast.success("Post created successfully! 🎉", {
              position: "top-right",
              autoClose: 3000,
            });
            setIsPostModalOpen(false);
            setPostContent("");
            setPostFile(null);
            setUploadProgress(0); // Reset progress state
          }
        );
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again." , {
              position: "top-center",
              autoClose: 3000,
            });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) {
      alert("Please log in to delete a post.");
      navigate("/loginPage");
      return;
    }

    try {
      // Delete post from "Post" collection
      await deleteDoc(doc(db, "Post", postId));

      // Delete post reference from user's subcollection
      const userPostRef = doc(db, `beatHubUsers/${currentUser.uid}/post/${postId}`);
      await deleteDoc(userPostRef);

      // Update local state to remove the post
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      toast.success("Post deleted successfully!" , {
              position: "top-center",
              autoClose: 3000,
            }); 
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again." , {
              position: "top-center",
              autoClose: 3000,
            });
    }
  };

  return (
    <div className="user-profile-page">
      {user ? (
        <>
          <div className="profile-header">
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt={`${user.username}'s profile`}
              className="profile-picture"
            />
            <h1>{user.username || "Unnamed Artist"}</h1>
            <div className="profile-stats">
            <span>
              <div>{postCount}</div>
              <div>posts</div>
            </span>
            <span>
              <div>{followersCount}</div>
              <div>followers</div>
            </span>
            <span>
              <div>{followingCount}</div>
              <div>following</div>
            </span>
            </div>
          </div>
          <p className="biography">{user.biography || "No bio yet. Stay tuned!"}</p>
          <div className="profile-buttons">
          <button
            className="follow-button"
            onClick={user.isFollowing ? handleUnfollow : handleFollow}
          >
            {user.isFollowing ? "Unfollow" : "Follow"}
          </button>
          <button
            className="view-store-button"
            onClick={() => navigate(`/store/${user.id}`)}
          >
            View Store
          </button>
          </div>
          <p className="email">{user.email}</p>

          {/* Display Create a Post Modal */}
          {isPostModalOpen && (
            <div className="post-modal" style={{ marginBottom: "20px", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2000 }}>
              <div className="post-modal-content">
                <h2>Create a Post</h2>
                <textarea
                  placeholder="Write something..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  style={{ width: "100%", height: "100px", marginBottom: "10px" }}
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setPostFile(e.target.files[0])}
                  style={{ marginBottom: "10px" }}
                />
                {uploadProgress > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <p>Uploading: {Math.round(uploadProgress)}%</p>
                    <progress value={uploadProgress} max="100" style={{ width: "100%" }} />
                  </div>
                )}
                <button onClick={handlePostSubmit} style={{ marginRight: "10px", backgroundColor: "#db3056", color: "white", padding: "10px 20px",
                   borderRadius: "5px", border: "none", cursor: "pointer" }}>
                  Submit
                </button>
                <button onClick={togglePostModal} style={{backgroundColor: "black", color: "#ffffff", borderRadius: "5px", 
                  border: "none", cursor: "pointer", padding: "10px 20px"}}>Cancel</button>
              </div>
            </div>
          )}

          {/* Display Posts */}
          <div className="user-posts">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="post-item"
                  style={{
                    marginBottom: "20px",
                    maxWidth: "600px",
                    margin: "0 auto",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                    position: "relative",
                  }}
                >
                  {/* Three-dot menu (visible only to the post owner) */}
                  {currentUser && currentUser.uid === post.userId && (
                    <div
                      className="post-options"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <SlOptionsVertical
                        onClick={() => togglePostOptions(post.id)}
                        size="1.5em"
                      />
                      {activePostOptions === post.id && (
                        <div
                          className="post-options-menu"
                          style={{
                            position: "absolute",
                            top: "30px",
                            right: "0",
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            padding: "10px",
                            zIndex: 1000,
                          }}
                        >
                          <button
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#db3056",
                              cursor: "pointer",
                              padding: "5px 10px",
                              textAlign: "left",
                              width: "100%",
                            }}
                            onClick={() => {
                              const confirmDelete = window.confirm("Are you sure you want to delete this post?");
                              if (confirmDelete) {
                                handleDeletePost(post.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                          <button
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#007bff",
                              cursor: "pointer",
                              padding: "5px 10px",
                              textAlign: "left",
                              width: "100%",
                            }}
                            onClick={() => handleSharePost(post.id)}
                          >
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Like Button */}
                  <div
                    className="post-like"
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      cursor: "pointer",
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: post.isLiked ? "#db3056" : "#aaa", // Change color based on like status
                        cursor: "pointer",
                        padding: "5px 10px",
                        textAlign: "center",
                      }}
                      onClick={() => toggleLikePost(post.id)}
                    >
                      ❤️ {post.likesCount || 0} Likes
                    </button>
                  </div>

                  {/* Share Button */}
                  <div
                    className="post-share"
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      cursor: "pointer",
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#007bff",
                        cursor: "pointer",
                        padding: "5px 10px",
                        textAlign: "center",
                      }}
                      onClick={() => handleSharePost(post.id)}
                    >
                      🔗 {post.sharesCount || 0} Shares
                    </button>
                  </div>

                  {/* Post Header */}
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

                  {/* Post Content */}
                  <p style={{ fontSize: "0.9em", marginBottom: "10px" }}>{post.content}</p>
                  {post.fileUrl && post.fileType && (
  <div
   style={{
      width: "100%",
      maxWidth: "400px",
      aspectRatio: "1 / 1",
      overflow: "hidden",
      backgroundColor: "#f0f0f0",
      margin: "0 auto 10px",
    }}
  >
    {post.fileType === "video" ? (
      <video
        src={post.fileUrl}
        controls
        preload="none"
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
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>Loading user profile...</p>
      )}

      {/* Floating Plus Icon */}
      {currentUser && currentUser.uid === userId && (
        <button
          className="floating-plus-icon"
          onClick={togglePostModal}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#db3056",
            color: "white",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "30px",
            textAlign: "center",
            lineHeight: "60px",
            border: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            cursor: "pointer",
            
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;