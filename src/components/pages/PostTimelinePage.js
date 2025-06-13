import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, getDoc, collection as subCollection, setDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting
import "../css/postTimelinePage.css";

const PostTimelinePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replayVisible, setReplayVisible] = useState({}); // Track replay button visibility for each video
  const navigate = useNavigate();
  const videoRefs = useRef({}); // Store references to video elements

  const syncMuteState = (isMuted) => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  };

  const handleVideoEnd = (videoId) => {
    setReplayVisible((prev) => ({ ...prev, [videoId]: true }));
  };

  const handleReplay = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      video.currentTime = 0; // Reset video to the beginning
      video.play().catch((err) => console.error("Error replaying video:", err));
      setReplayVisible((prev) => ({ ...prev, [videoId]: false })); // Hide replay button
    }
  };

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postCollectionRef = collection(db, "Post");
        const postSnapshot = await getDocs(postCollectionRef);

        const fetchedPosts = await Promise.all(
          postSnapshot.docs.map(async (doc) => {
            const postData = doc.data();

            // Fetch likes and shares count from subcollections
            const likesSnapshot = await getDocs(subCollection(doc.ref, "likes"));
            const sharesSnapshot = await getDocs(subCollection(doc.ref, "shares"));

            return {
              id: doc.id,
              ...postData,
              likesCount: likesSnapshot.size,
              sharesCount: sharesSnapshot.size,
            };
          })
        );

        // Fetch all user data
        const userCollectionRef = collection(db, "beatHubUsers");
        const userSnapshot = await getDocs(userCollectionRef);

        const usersMap = userSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        // Combine post data with user data
        const combinedPosts = fetchedPosts.map((post) => ({
          ...post,
          username: usersMap[post.userId]?.username || "Unnamed Artist",
          userProfilePicture: usersMap[post.userId]?.profilePicture || "/default-avatar.png",
        }));

        // Sort posts by timestamp and likes with 3:1 priority for likes
        const sortedPosts = combinedPosts.sort((a, b) => {
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            // Pause all other videos
            Object.values(videoRefs.current).forEach((vid) => {
              if (vid !== video) {
                vid.pause();
              }
            });
            // Play the current video
            video.play().catch((err) => console.error("Error playing video:", err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => {
          if (video) {
            video.pause();
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleMouseEnter = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video && !replayVisible[videoId]) {
      // Pause all other videos
      Object.values(videoRefs.current).forEach((vid) => {
        if (vid !== video) {
          vid.pause();
        }
      });
      // Play the hovered video
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

        // Find and play the video whose center is closest to the viewport center
        let closestVideo = null;
        let closestDistance = Infinity;

        Object.values(videoRefs.current).forEach((vid) => {
          const vidRect = vid.getBoundingClientRect();
          const vidCenterX = (vidRect.left + vidRect.right) / 2;
          const vidCenterY = (vidRect.top + vidRect.bottom) / 2;

          const distanceToViewportCenter = Math.sqrt(
            Math.pow(vidCenterX - viewportCenterX, 2) +
            Math.pow(vidCenterY - viewportCenterY, 2)
          );

          if (distanceToViewportCenter < closestDistance) {
            closestDistance = distanceToViewportCenter;
            closestVideo = vid;
          }
        });

        if (closestVideo) {
          closestVideo.play().catch((err) => console.error("Error playing video:", err));
        }
      }
    }
  };

  const handleMuteToggle = (shouldMute) => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = shouldMute;
      }
    });
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, "Post", postId);
      const likesRef = subCollection(postRef, "likes");
      const userLikeDoc = doc(likesRef, "currentUserId"); // Replace with actual user ID
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
    try {
      const postRef = doc(db, "Post", postId);
      const sharesRef = subCollection(postRef, "shares");
      const userShareDoc = doc(sharesRef, "currentUserId"); // Replace with actual user ID
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
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

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
                  {formatTimestamp(post.timestamp)}
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
                  position: "relative", // Enable positioning for replay button
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/view-post/${post.id}`)} // Navigate only when clicking on post content
              >
                {post.fileType === "video" ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[post.id] = el)}
                      src={post.fileUrl}
                      controls
                      muted
                      controlsList="nodownload nofullscreen noplaybackrate" // Disable fullscreen and other controls
                      disablePictureInPicture // Disable Picture-in-Picture mode
                      onVolumeChange={(e) => syncMuteState(e.target.muted)} // Sync mute state across all videos
                      onMouseEnter={() => handleMouseEnter(post.id)} // Play video on hover if not in replay state
                      onMouseLeave={() => handleMouseLeave(post.id)} // Ensure viewport center video plays if paused
                      onEnded={() => handleVideoEnd(post.id)} // Show replay button when video ends
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                        display: "block",
                      }}
                      preload="auto" // Allow video to load
                    />
                    {replayVisible[post.id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation when clicking replay
                          handleReplay(post.id);
                        }}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                        }}
                      >
                        <span>Replay</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="white"
                          width="20px"
                          height="20px"
                        >
                          <path d="M12 5V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                      </button>
                    )}
                  </>
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
                  handleLike(post.id);
                }}
              >
                ❤️ {post.likesCount || 0} Likes
              </span>
              <span
                style={{ color: "#007bff", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking share
                  handleShare(post.id);
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
