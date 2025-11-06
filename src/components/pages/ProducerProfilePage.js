import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaPlay, FaPause} from "react-icons/fa";
import { FaCartShopping, FaIgloo } from "react-icons/fa6";
import djImage from '../../images/dj.jpg';
import GroupA from "../component/header";
import "../css/producerProfilePage.css";
import { SiTiktok } from "react-icons/si";
import { FaSoundcloud, FaInstagram, FaDownload,FaYoutube,FaPlus } from "react-icons/fa";
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
    const socialRef = doc(db, "Social", userId);
    const socialSnap = await getDoc(socialRef);
    if (!socialSnap.exists()) return;

    const followers = socialSnap.data().followers || [];
    const isFollowing = followers.includes(currentUser.uid);

    const { updateDoc, arrayUnion, arrayRemove } = await import("firebase/firestore");

    await updateDoc(socialRef, {
      followers: isFollowing
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid)
    });

    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
    setUser(prev => ({ ...prev, isFollowing: !isFollowing }));
  };

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
              <button onClick={handleFollowUnfollow} className="producerProfilePage-follow-button"> <FaPlus size="0.7em"  />
                {user.isFollowing ? "Unfollow" : "Follow"}
              </button>
            <div className="producerProfilePage-profile-stats">
            
            <div  className="producerProfilePage-socials-title"  >STATS</div>
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

            <hr style={{ border: "1px solid #ccc", margin: "20px 0" }} />
            <div className="divider"></div>
<div className="producerProfilePage-socials">
            <div  className="producerProfilePage-socials-title"  >FIND ME ON</div>
            
      <div href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <FaInstagram /> Instagram
      </div>
    
      <div href="https://youtube.com" target="_blank" rel="noopener noreferrer">
        <FaYoutube /> Youtube
      </div>
      <div href="https://soundcloud.com" target="_blank" rel="noopener noreferrer">
        <FaSoundcloud /> Soundcloud
      </div>
      <div href="https://tiktok.com" target="_blank" rel="noopener noreferrer"> 
        <SiTiktok /> Tiktok
      </div>
            </div>
          </div>
          
          </div>


          <div className="producerProfile-beat-list">
            {beats.length === 0 && <p>No beats uploaded yet.</p>}
            {beats.map((beat, index) => (
              <div key={beat.id} className="producerProfile-beat-item">
                <img
                  src={beat.coverUrl || djImage}
                  alt={beat.title || "Untitled Beat"}
                  className="beat-cover"
                />
                <div className="producerProfile-beat-info-container">
                  <h3 className="producerProfile-beat-title">{beat.title || "Untitled Beat"}</h3>
                  {/* <button onClick={() => handlePlayPause(beat.musicUrls?.taggedMp3, index)}>
                    {playingIndex === index ? <FaPause /> : <FaPlay />}
                  </button> */}
                 <div className="producerProfilePage-buttons-container">
  <Link to={`/addToCart/${beat.id}`}>
    <button className="producerProfile-beat-add-to-cart-button">
      <FaCartShopping size="1em" />{" "}
      {formatPrice(parsePrice(beat.monetization?.basic?.price))}
    </button>
  </Link>

  {beat.monetization?.free?.enabled === true && (
    <button
      className="producerProfile-beat-download-button"
      onClick={() => window.open(beat.musicUrls?.taggedMp3, "_blank")}
    >
      <FaDownload  />
    </button>
  )}
</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
      
    </div></div>
  );
};

export default ProducerProfilePage;