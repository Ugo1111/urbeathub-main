import React, { useState, useEffect, useRef } from "react";
import "../css/component.css";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaRegHeart, FaShare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const shuffleArray = (array) =>
  array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const HomePageFeed = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const videoRefs = useRef({});

  const syncMuteState = (isMuted) => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserId(currentUser.uid);
        }

        const postSnapshot = await getDocs(collection(db, "Post"));
        const userSnapshot = await getDocs(collection(db, "beatHubUsers"));

        const usersMap = userSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const allPosts = await Promise.all(
          postSnapshot.docs.map(async (docSnap) => {
            const postData = docSnap.data();
            const userData = usersMap[postData.userId] || {};

            // Fetch likes and shares from subcollections
            const likesSnapshot = await getDocs(collection(doc(db, "Post", docSnap.id), "likes"));
            const sharesSnapshot = await getDocs(collection(doc(db, "Post", docSnap.id), "shares"));

            return {
              id: docSnap.id,
              ...postData,
              userName: userData.username || "Unnamed Artist",
              userProfilePic: userData.profilePicture || "/images/Mixer.jpg",
              likesCount: likesSnapshot.size,
              sharesCount: sharesSnapshot.size,
            };
          })
        );

        setPosts(shuffleArray(allPosts));
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            Object.values(videoRefs.current).forEach((vid) => {
              if (vid !== video) {
                vid.pause();
              }
            });
            video.play().catch((err) => console.error("Error playing video:", err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [posts]);

  const handleLike = async (postId) => {
    if (!userId) return alert("Please login to like posts.");

    try {
      const postRef = doc(db, "Post", postId);
      const likesRef = collection(postRef, "likes");
      const userLikeDoc = doc(likesRef, userId); // Uses actual userId
      const userLikeSnapshot = await getDoc(userLikeDoc);

      if (userLikeSnapshot.exists()) {
        console.log("Already liked");
      } else {
        await setDoc(userLikeDoc, { likedAt: new Date() });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleShare = async (postId) => {
    if (!userId) return alert("Please login to share posts.");

    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);

      const postRef = doc(db, "Post", postId);
      const sharesRef = collection(postRef, "shares");
      const userShareDoc = doc(sharesRef, userId);
      const userShareSnapshot = await getDoc(userShareDoc);

      if (userShareSnapshot.exists()) {
        console.log("Already shared");
      } else {
        await setDoc(userShareDoc, { sharedAt: new Date() });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, sharesCount: post.sharesCount + 1 } : post
          )
        );
      }

      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error("Failed to share post:", err);
    }
  };

  const handleMouseEnter = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      Object.values(videoRefs.current).forEach((vid) => {
        if (vid !== video) vid.pause();
      });
      video.play().catch((err) => console.error("Error playing video:", err));
    }
  };

  const handleMouseLeave = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      const rect = video.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const isInViewportCenter =
        rect.top <= viewportCenterY &&
        rect.bottom >= viewportCenterY &&
        rect.left <= viewportCenterX &&
        rect.right >= viewportCenterX;

      if (!isInViewportCenter) {
        video.pause();

        let closestVideo = null;
        let closestDistance = Infinity;

        Object.values(videoRefs.current).forEach((vid) => {
          const vidRect = vid.getBoundingClientRect();
          const vidCenterX = (vidRect.left + vidRect.right) / 2;
          const vidCenterY = (vidRect.top + vidRect.bottom) / 2;

          const distance = Math.sqrt(
            Math.pow(vidCenterX - viewportCenterX, 2) +
            Math.pow(vidCenterY - viewportCenterY, 2)
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestVideo = vid;
          }
        });

        if (closestVideo) {
          closestVideo.play().catch((err) => console.error("Error playing video:", err));
        }
      }
    }
  };

  return (
    <div className="post-card-container">
      <div style={{ padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Posts From Our Community
        </h2>

        <div className="feed-scroll-container">
          {posts.slice(0, 4).map((post) => {
            return (
              <div key={post.id} className="post-card">
                {/* User Info */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <img
                    src={post.userProfilePic}
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

                {/* Image or Video */}
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
                    ref={(el) => (videoRefs.current[post.id] = el)}
                    src={post.fileUrl}
                    controls
                    muted
                    controlsList="nodownload nofullscreen noplaybackrate"
                    disablePictureInPicture
                    onVolumeChange={(e) => syncMuteState(e.target.muted)}
                    onMouseEnter={() => handleMouseEnter(post.id)}
                    onMouseLeave={() => handleMouseLeave(post.id)}
                    style={{
                      width: "100%",
                      maxHeight: "180px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "gray", fontSize: "0.8em" }}>
                    {post.timestamp
                      ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
                      : "Just now"}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span
                      onClick={() => handleLike(post.id)}
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <FaHeart />
                      <span style={{ fontSize: "0.8em" }}>{post.likesCount}</span>
                    </span>

                    <span
                      onClick={() => handleShare(post.id)}
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <FaShare />
                      <span style={{ fontSize: "0.8em" }}>{post.sharesCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
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