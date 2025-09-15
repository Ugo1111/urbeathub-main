import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase"; // Import Firebase Auth
import "../css/userProfilePage.css";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting timestamps
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"; // Import Firebase Storage
import { SlOptionsVertical } from "react-icons/sl"; // Import three-dot icon
import { ToastContainer, toast } from "react-toastify";
import { IoShareSocialOutline } from "react-icons/io5"; // Import a different share icon

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [editPostContent, setEditPostContent] = useState(""); // State for edited post content
  const [editPostFile, setEditPostFile] = useState(null); // State for edited post file
  const [editPostId, setEditPostId] = useState(null); // State for the post being edited

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

  const toggleEditModal = (post) => {
    setIsEditModalOpen((prevState) => !prevState);
    if (!isEditModalOpen) {
      setEditPostContent(post.content);
      setEditPostFile(null);
      setEditPostId(post.id);
    }
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
            post.id === postId
              ? { ...post, likesCount: (post.likesCount || 0) - 1 }
              : post
          )
        );
      } else {
        // Like the post
        await setDoc(userLikeRef, {
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likesCount: (post.likesCount || 0) + 1 }
              : post
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
        await setDoc(userShareRef, {
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, sharesCount: (post.sharesCount || 0) + 1 }
              : post
          )
        );
      }

      // Share the post link
      const shareUrl = `${window.location.origin}/post/${postId}`;
      if (navigator.share) {
        navigator
          .share({
            title: "Post from BeatHub",
            text: `Check out this post: ${shareUrl}`,
            url: shareUrl,
          })
          .catch((error) => console.error("Error sharing post:", error));
      } else {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            alert("Post link copied to clipboard!");
          })
          .catch((error) => console.error("Error copying link:", error));
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Failed to share post. Please try again.");
    }
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/profile/${userId}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${user?.username || "User"}'s Profile on BeatHub`,
          text: `Check out this profile on BeatHub: ${
            user?.username || "User"
          }`,
          url: shareUrl,
        })
        .catch((error) => console.error("Error sharing profile:", error));
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert("Profile link copied to clipboard!");
        })
        .catch((error) => console.error("Error copying link:", error));
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
          userData.isFollowing = currentUser
            ? followers.includes(currentUser.uid)
            : false;
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

        // Fetch posts from the "Post" collection and sort by timestamp
        const postCollectionRef = collection(db, "Post");
        const postSnapshotFromPostCollection = await getDocs(postCollectionRef);
        const userPosts = postSnapshotFromPostCollection.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => post.userId === id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp (newest first)
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

  const fetchLikesCount = async (postId) => {
    try {
      const likesRef = collection(db, `Post/${postId}/likes`);
      const likesSnapshot = await getDocs(likesRef);
      return likesSnapshot.size;
    } catch (error) {
      console.error("Error fetching likes count:", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchPostsWithLikes = async () => {
      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          const likesCount = await fetchLikesCount(post.id);
          return { ...post, likesCount };
        })
      );
      setPosts(updatedPosts);
    };

    if (posts.length > 0) {
      fetchPostsWithLikes();
    }
  }, [posts]);

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
      toast.error("Please log in to create a post.", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/loginPage");
      return;
    }

    try {
      const storage = getStorage(); // Initialize Firebase Storage
      let fileUrl = null;
      let fileType = null;

      if (postFile) {
        const storageRef = ref(
          storage,
          `posts/${currentUser.uid}/${postFile.name}`
        ); // Create a reference in Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, postFile); // Create a resumable upload task

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update progress state
          },
          (error) => {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file. Please try again.", {
              position: "top-center",
              autoClose: 3000,
            });
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref); // Get the public download URL
            fileType = postFile.type.startsWith("video") ? "video" : "image"; // Determine file type

            // Save the post after file upload
            await savePost(fileUrl, fileType);
          }
        );
      } else {
        // Save the post without file upload
        await savePost(null, null);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const savePost = async (fileUrl, fileType) => {
    const postCollectionRef = collection(db, "Post");
    const newPost = {
      userId: currentUser.uid,
      content: postContent,
      fileUrl, // Use the public download URL or null
      fileType, // Save the file type or null
      timestamp: new Date().toISOString(),
    };

    const postDocRef = await addDoc(postCollectionRef, newPost);

    // Save a reference to the post in the user's subcollection
    const userPostRef = collection(db, `beatHubUsers/${currentUser.uid}/post`);
    await setDoc(doc(userPostRef, postDocRef.id), {
      postId: postDocRef.id,
      timestamp: newPost.timestamp,
    });

    // Add the new post to the posts state
    setPosts((prevPosts) => [{ id: postDocRef.id, ...newPost }, ...prevPosts]);

    toast.success("Post created successfully!", {
      position: "top-center",
      autoClose: 3000,
    });

    setIsPostModalOpen(false);
    setPostContent("");
    setPostFile(null);
    setUploadProgress(0); // Reset progress state
  };

  const saveEditedPost = async (fileUrl, fileType) => {
    const postRef = doc(db, "Post", editPostId);
    const existingPost = posts.find((post) => post.id === editPostId); // Retrieve the existing post

    const updatedPost = {
      content: editPostContent,
      fileUrl: fileUrl || existingPost?.fileUrl, // Retain existing file URL if not replaced
      fileType: fileType || existingPost?.fileType, // Retain existing file type if not replaced
      timestamp: existingPost?.timestamp, // Retain the original timestamp
    };

    try {
      await updateDoc(postRef, updatedPost);

      // Update local state to reflect the edited post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editPostId ? { ...post, ...updatedPost } : post
        )
      );

      toast.success("Post updated successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      setIsEditModalOpen(false);
      setEditPostContent("");
      setEditPostFile(null);
      setUploadProgress(0); // Reset progress state
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleEditPostSubmit = async () => {
    if (!currentUser) {
      toast.error("Please log in to edit a post.", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/loginPage");
      return;
    }

    try {
      const storage = getStorage(); // Initialize Firebase Storage
      let fileUrl = null;
      let fileType = null;

      if (editPostFile) {
        const storageRef = ref(
          storage,
          `posts/${currentUser.uid}/${editPostFile.name}`
        ); // Create a reference in Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, editPostFile); // Create a resumable upload task

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update progress state
          },
          (error) => {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file. Please try again.", {
              position: "top-center",
              autoClose: 3000,
            });
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref); // Get the public download URL
            fileType = editPostFile.type.startsWith("video")
              ? "video"
              : "image"; // Determine file type

            // Save the edited post after file upload
            await saveEditedPost(fileUrl, fileType);
          }
        );
      } else {
        // Save the edited post without file upload
        await saveEditedPost(null, null);
      }
    } catch (error) {
      console.error("Error editing post:", error);
      toast.error("Failed to edit post. Please try again.", {
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
      const userPostRef = doc(
        db,
        `beatHubUsers/${currentUser.uid}/post/${postId}`
      );
      await deleteDoc(userPostRef);

      // Update local state to remove the post
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      toast.success("Post deleted successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const postModal = document.querySelector(".post-modal");
      const editModal = document.querySelector(".post-modal-content");

      if (postModal && !postModal.contains(event.target)) {
        setIsPostModalOpen(false);
      }

      if (editModal && !editModal.contains(event.target)) {
        setIsEditModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <p className="biography">
            {user.biography || "No bio yet. Stay tuned!"}
          </p>
          <div
            className="profile-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              className="follow-button"
              onClick={user.isFollowing ? handleUnfollow : handleFollow}>
              {user.isFollowing ? "Unfollow" : "Follow"}
            </button>
            <button
              className="view-store-button"
              onClick={() => navigate(`/store/${user.id}`)}>
               View Store
            </button>
            <button
              className="share-profile-button"
              onClick={handleShareProfile}
              title="Share Profile" // Tooltip for accessibility
            >
              <IoShareSocialOutline size="1.5em" color="#db3056" />
            </button>
          </div>

          {/* Display Create a Post Modal */}
          {isPostModalOpen && (
  <div className="post-modal" onClick={togglePostModal}>
    <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>Create a Post</h2>
      <textarea
        className="post-textarea"
        placeholder="Write something..."
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setPostFile(e.target.files[0])}
        className="post-file-input"
      />
      {uploadProgress > 0 && (
        <div className="upload-progress">
          <p>Uploading: {Math.round(uploadProgress)}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}
      <div className="post-button-group">
  <button onClick={handlePostSubmit} className="post-submit">
    Submit
  </button>
  <button onClick={togglePostModal} className="post-cancel">
    Cancel
  </button>
</div>

    </div>
  </div>
)}


          {/* Display Edit Post Modal */}
         {isEditModalOpen && (
  <div className="edit-post-modal" onClick={() => setIsEditModalOpen(false)}>
    <div
      className="edit-post-modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Edit Post</h2>
      <textarea
        placeholder="Edit your post content..."
        value={editPostContent}
        onChange={(e) => setEditPostContent(e.target.value)}
      />
      {posts.find((post) => post.id === editPostId)?.fileUrl && (
        <div style={{ marginBottom: "10px" }}>
          {posts.find((post) => post.id === editPostId)?.fileType ===
          "video" ? (
            <video
              className="edit-video"
              src={posts.find((post) => post.id === editPostId)?.fileUrl}
              controls
            />
          ) : (
            <img
              className="edit-image"
              src={posts.find((post) => post.id === editPostId)?.fileUrl}
              alt="Existing content"
            />
          )}
        </div>
      )}
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setEditPostFile(e.target.files[0])}
      />
      {uploadProgress > 0 && (
        <div>
          <p>Uploading: {Math.round(uploadProgress)}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}
      <button onClick={handleEditPostSubmit} className="submit-button">
        Save Changes
      </button>
      <button
        onClick={() => setIsEditModalOpen(false)}
        className="cancel-button"
      >
        Cancel
      </button>
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
                 >
                  {/* Three-dot menu (visible only to the post owner) */}
                  {currentUser && currentUser.uid === post.userId && (
  <div className="post-options">
    <SlOptionsVertical
      onClick={() => togglePostOptions(post.id)}
      size="1.5em"
      className="post-options-icon"
    />
    {activePostOptions === post.id && (
      <div className="post-options-menu">
        <button
          className="delete"
          onClick={(e) => {
            e.stopPropagation();
            const confirmDelete = window.confirm("Are you sure you want to delete this post?");
            if (confirmDelete) {
              handleDeletePost(post.id);
              setActivePostOptions(null); // Close dropdown
            }
          }}
        >
          Delete
        </button>
        <button
          className="edit"
          onClick={(e) => {
            e.stopPropagation();
            toggleEditModal(post);
            setActivePostOptions(null); // Close dropdown
          }}
        >
          Edit
        </button>
        <button
          className="share"
          onClick={(e) => {
            e.stopPropagation();
            handleSharePost(post.id);
            setActivePostOptions(null); // Close dropdown
          }}
        >
          Share
        </button>
      </div>
    )}
  </div>
)}

                  {/* Like Button */}
<div className="post-like">
  <button
    className={`like-button ${post.isLiked ? "liked" : ""}`}
    onClick={(e) => {
      e.stopPropagation();
      toggleLikePost(post.id);
    }}
  >
    ❤️ {post.likesCount || 0} Likes
  </button>
</div>

{/* Share Button */}
<div className="post-share">
  <button
    className="share-button"
    onClick={(e) => {
      e.stopPropagation();
      handleSharePost(post.id);
    }}
  >
    🔗 {post.sharesCount || 0} Shares
  </button>
</div>

                  {/* Post Header */}
<div className="post-header">
  <img
    src={user.profilePicture || "/default-avatar.png"}
    alt={`${user.username}'s profile`}
    className="profile-picture"
  />
  <div>
    <p className="username">{user.username || "Unnamed Artist"}</p>
    <p className="timestamp">
      {formatDistanceToNow(new Date(post.timestamp), {
        addSuffix: true,
      })}
    </p>
  </div>
</div>
                  {/* Post Content */}
                  <p
                    style={{
                      fontSize: "0.9em",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}
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
          
        >
          +
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;