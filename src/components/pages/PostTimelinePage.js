// IMPORTANT: Do not use inline styles. Use external CSS classes only.
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, getDoc, collection as subCollection, setDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for formatting
import "../css/postTimelinePage.css";
import { HomeHeader } from "../component/header";

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

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
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
    return (
      <div className="skeleton-container">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton-post">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-header-text">
                <div className="skeleton-header-line long"></div>
                <div className="skeleton-header-line short"></div>
              </div>
            </div>
            <div className="skeleton-content long"></div>
            <div className="skeleton-content short"></div>
            <div className="skeleton-media"></div>
            <div className="skeleton-footer">
              <div className="skeleton-footer-button"></div>
              <div className="skeleton-footer-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="post-timeline-page">
      <HomeHeader />
      <h1>Post Feed</h1>
      <div className="post-list">
        {posts.map((post) => (
          <div
            key={post.id}
            className="post-item-container" // Use the external CSS class
          >
            {/* Post Header */}
            <div 
              className="post-header-container"
              onClick={() => handleProfileClick(post.userId)}
            >
              <img
                src={post.userProfilePicture || "/default-avatar.png"}
                alt={`${post.username || "User"}'s profile`}
                className="post-header-image"
              />
              <div>
                <p className="post-header-text">
                  {post.username || "Unnamed Artist"}
                </p>
                <p className="post-header-subtext">
                  {formatTimestamp(post.timestamp)}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p
              className="post-content-text" // Use the external CSS class
              onClick={() => navigate(`/view-post/${post.id}`)} // Navigate only when clicking on post content
            >
              {post.content}
            </p>
            {post.fileUrl && post.fileType && (
              <div
                className="post-media-container" // Use the external CSS class
                onClick={() => navigate(`/view-post/${post.id}`)} // Navigate only when clicking on post content
              >
                {post.fileType === "video" ? (
                  <>
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
                      onEnded={() => handleVideoEnd(post.id)}
                      className="post-media-content" // Use the external CSS class
                      preload="auto"
                    />
                    {replayVisible[post.id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation when clicking replay
                          handleReplay(post.id);
                        }}
                        className="replay-button" // Use the external CSS class
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
                    className="post-media-content" // Use the external CSS class
                  />
                )}
              </div>
            )}

            {/* Like and Share Info */}
            <div className="post-footer">
              <span
                className="post-footer-like" // Use the external CSS class
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking like
                  handleLike(post.id);
                }}
              >
                ❤️ {post.likesCount || 0} Likes
              </span>
              <span
                className="post-footer-share" // Use the external CSS class
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