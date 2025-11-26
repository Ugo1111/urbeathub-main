import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, collection, getDocs, query, where, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaPlay, FaPause } from "react-icons/fa";
import { FaCartShopping, FaIgloo } from "react-icons/fa6";
import djImage from '../../images/dj.jpg';
import GroupA from "../component/header";
import "../css/producerProfilePage.css";
import { SiTiktok } from "react-icons/si";
import { FaSoundcloud, FaInstagram, FaDownload, FaYoutube, FaPlus, FaChevronUp, FaChevronDown } from "react-icons/fa";


const ProducerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [beats, setBeats] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const audioRef = useRef(new Audio());
  const [activeTab, setActiveTab] = useState("info");

  const parsePrice = (price) => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount) usdAmount = 0;
    return `$${usdAmount.toFixed(2)}`;
  };




  // Get current logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setCurrentUser(user ? { uid: user.uid, email: user.email } : null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile and beats
  useEffect(() => {
    const fetchUserAndBeats = async () => {
      try {
        // Fetch user profile
        const userDocRef = doc(db, "beatHubUsers", userId);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return;
        const userData = { id: userSnap.id, ...userSnap.data() };

        // Fetch social info
        const socialRef = doc(db, "Social", userId);
        const socialSnap = await getDoc(socialRef);
        if (socialSnap.exists()) {
          const socialData = socialSnap.data();
          setFollowersCount(socialData.followers?.length || 0);
          setFollowingCount(socialData.following?.length || 0);
          userData.isFollowing = currentUser
            ? socialData.followers?.includes(currentUser.uid)
            : false;
        }

        setUser(userData);

        // Fetch beats uploaded by user
        const beatsQuery = query(
          collection(db, "beats"),
          where("userId", "==", userId)
        );
        const beatsSnap = await getDocs(beatsQuery);
        const beatsData = beatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBeats(beatsData);
      } catch (error) {
        console.error("Error fetching profile or beats:", error);
      }
    };

    if (userId) fetchUserAndBeats();
  }, [userId, currentUser]);

  const handlePlayPause = (beatUrl, index) => {
    if (!beatUrl) return;
    const audio = audioRef.current;
    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }
    audio.pause();
    audio.src = beatUrl;
    audio.load();
    audio.play().catch(console.error);
    setPlayingIndex(index);
    audio.onended = () => setPlayingIndex(null);
  };

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      alert("Log in to follow/unfollow.");
      navigate("/loginPage");
      return;
    }

    try {
      const socialRef = doc(db, "Social", userId); // producer’s social doc
      const currentUserSocialRef = doc(db, "Social", currentUser.uid); // current logged-in user's social doc
      const socialSnap = await getDoc(socialRef);
      const currentUserSocialSnap = await getDoc(currentUserSocialRef);

      // Ensure both documents exist before updating
      if (!socialSnap.exists()) {
        await setDoc(socialRef, { followers: [], following: [] });
      }
      if (!currentUserSocialSnap.exists()) {
        await setDoc(currentUserSocialRef, { followers: [], following: [] });
      }

      const producerData = (await getDoc(socialRef)).data();
      const currentUserData = (await getDoc(currentUserSocialRef)).data();

      const followers = producerData.followers || [];
      const following = currentUserData.following || [];

      const isFollowing = followers.includes(currentUser.uid);

      const { updateDoc, arrayUnion, arrayRemove } = await import("firebase/firestore");

      if (isFollowing) {
        // Unfollow
        await updateDoc(socialRef, {
          followers: arrayRemove(currentUser.uid),
        });
        await updateDoc(currentUserSocialRef, {
          following: arrayRemove(userId),
        });
        setFollowersCount((prev) => prev - 1);
      } else {
        // Follow
        await updateDoc(socialRef, {
          followers: arrayUnion(currentUser.uid),
        });
        await updateDoc(currentUserSocialRef, {
          following: arrayUnion(userId),
        });
        setFollowersCount((prev) => prev + 1);
      }

      setUser((prev) => ({ ...prev, isFollowing: !isFollowing }));
    } catch (error) {
      console.error("Error updating follow/unfollow:", error);
    }
  };



  const SkeletonBeatItem = () => (
    <div className="skeleton-beat-item">
      <div className="skeleton skeleton-cover"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-button-group">
        <div className="skeleton skeleton-button"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );

  const SkeletonProfile = () => (
    <div className="skeleton-profile">
      <div className="skeleton skeleton-avatar"></div>
      <div className="skeleton skeleton-name"></div>
      <div className="skeleton skeleton-bio"></div>
      <div className="skeleton skeleton-stat"></div>
      <div className="skeleton skeleton-stat"></div>
      <div className="skeleton skeleton-follow"></div>
    </div>
  );

  return (
    <div className="producerProfilePage-body">
      <GroupA />
      <div className="producerProfilePage-MainContainer">


        {user ? (
          <>
            <div className="producerProfilePage-songBioSection">
              <div className="profile-header">
                <img
                  src={user.profilePicture || djImage}
                  alt={user.username || "Producer"}
                  className="profile-picture"
                />
                <h1>{user.username || "Unnamed Artist"}</h1>
                <h2 className="producerProfilePage-profile-Bio"> {user.biography || "🔥 Turning vibes into hits, one track at a time"}</h2>
                <button onClick={handleFollowUnfollow} className="producerProfilePage-follow-button"> <FaPlus size="0.7em" style={{ marginRight: "5px" }} />
                  {user.isFollowing ? "Unfollow" : "Follow"}
                </button>

              </div>
              <button className="producerProfilePage-igloo-button"


                onClick={() => setActiveTab(prev => (prev === "info" ? "" : "info"))}
              >
                {activeTab === "info" ?  <FaChevronDown /> : <FaChevronUp />} 
              </button>
              <div className={`producerProfilePage-profile-profile-info ${activeTab === "info" ? "active" : ""}`}>
                <div className="producerProfilePage-profile-stats">

                  <div className="producerProfilePage-socials-title"  >STATS</div>
                  <span >
                    <div>Tracks</div>
                    <div>{beats.length}</div>
                  </span>
                  <span>
                    <div>Followers</div>
                    <div>{followersCount}</div>
                  </span>
                  {/* <span>
                <div>{followingCount}</div>
                <div>following</div>
                </span> */}
                </div>


                <div className="producerProfilePage-divider"></div>
                {user?.socials && (
                  <div className="producerProfilePage-socials">
                    <div className="producerProfilePage-socials-title">FIND ME ON</div>

                    {user.socials.instagram && (
                      <a href={user.socials.instagram} target="_blank" rel="noopener noreferrer">
                        <FaInstagram /> Instagram
                      </a>
                    )}

                    {user.socials.youtube && (
                      <a href={user.socials.youtube} target="_blank" rel="noopener noreferrer">
                        <FaYoutube /> YouTube
                      </a>
                    )}

                    {user.socials.soundcloud && (
                      <a href={user.socials.soundcloud} target="_blank" rel="noopener noreferrer">
                        <FaSoundcloud /> SoundCloud
                      </a>
                    )}

                    {user.socials.tiktok && (
                      <a href={user.socials.tiktok} target="_blank" rel="noopener noreferrer">
                        <SiTiktok /> TikTok
                      </a>
                    )}
                  </div>
                )}

              </div>
            </div>

            <div className="producerProfile-beats-section">
              <h2 className="producerProfile-beat-list-title">Tracks</h2>
              <div className="producerProfile-beat-list">
                {beats.length === 0 && <p>No beats uploaded yet.</p>}
                {beats.map((beat, index) => (
                  <div key={beat.id} className="producerProfile-beat-item">

                    <div className="producerProfile-beat-cover-container">
                      <Link to={`/addToCart/${beat.id}`} className="beat-link">
                        <img
                          src={beat.coverUrl || djImage}
                          alt={beat.title || "Untitled Beat"}
                          className="beat-cover"
                        /></Link>
                      <button
                        className="beat-play-button"
                        onClick={() => handlePlayPause(beat.musicUrls?.taggedMp3, index)}
                      >
                        {playingIndex === index ? <FaPause style={{ marginLeft: "5px" }} /> : <FaPlay style={{ marginLeft: "5px" }} />}
                      </button>
                    </div>
                    <div className="producerProfile-beat-info-container">

                      <Link to={`/addToCart/${beat.id}`} className="producerProfile-beat-link">
                        <h3 className="producerProfile-beat-title">{beat.title || "Untitled Beat"}</h3>
                      </Link>
                      {/* <button onClick={() => handlePlayPause(beat.musicUrls?.taggedMp3, index)}>
                    {playingIndex === index ? <FaPause /> : <FaPlay />}
                   </button> */}


                      <div className="producerProfilePage-buttons-container">

                        <Link to={`/addToCart/${beat.id}`} className="producerProfile-beat-link">
                          <button className="producerProfile-beat-add-to-cart-button">
                            <FaCartShopping style={{ marginRight: "5px" }} />
                            {formatPrice(parsePrice(beat.monetization?.basic?.price))}
                          </button>
                        </Link>

                        {beat.monetization?.free?.enabled === true && (
                          <button
                            className="producerProfile-beat-download-button"
                            onClick={() => window.open(beat.musicUrls?.taggedMp3, "_blank")}
                          >
                            <FaDownload />
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p>Loading profile...</p>
        )}

      </div></div>
  );
};

export default ProducerProfilePage;