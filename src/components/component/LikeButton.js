import React, { useState, useEffect } from "react";
import { 
  getFirestore, doc, setDoc, deleteDoc, getDoc, collection, getDocs, query, where,
  arrayRemove, arrayUnion 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaHeart } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique like ID

const LikeButton = ({ songId, size }) => {
  const [like, setLike] = useState(false); // State to track like status
  const [likeCount, setLikeCount] = useState(0); // State to track like count
  const [likeId, setLikeId] = useState(null); // Store generated likeId
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch total likes count
  useEffect(() => {
    if (songId) {
      const fetchLikeCount = async () => {
        const likesRef = collection(db, `beats/${songId}/likes`);
        const likesSnapshot = await getDocs(likesRef);
        setLikeCount(likesSnapshot.size);
      };
      fetchLikeCount();
    }
  }, [songId]);

  // Check if user has already liked the song
  useEffect(() => {
    if (user && songId) {
      const checkIfLiked = async () => {
        const likesRef = collection(db, `beats/${songId}/likes`);
        const q = query(likesRef, where("userId", "==", user.uid));
        const likeSnap = await getDocs(q);
        
        if (!likeSnap.empty) {
          setLike(true);
          setLikeId(likeSnap.docs[0].id); // Store the likeId
        }
      };
      checkIfLiked();
    }
  }, [user, songId]);

  // Handle like/unlike functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please sign in to like songs.");
      return;
    }

    const newLikeId = likeId || uuidv4(); // Generate a new ID if it doesn’t exist
    const likeRef = doc(db, `beats/${songId}/likes/${newLikeId}`);
    const userRef = doc(db, `beatHubUsers/${user.uid}`);
   
    if (like) {
      // Unlike: Delete the like document
       // Unlike: Delete both like document and the user reference
       await deleteDoc(likeRef); // Delete the like document
      
       // Optionally, remove the likeId from the likedBeats array for the user
       await setDoc(userRef, { likedBeats: arrayRemove(newLikeId) }, { merge: true });
       
      setLike(false);
      setLikeCount((prev) => prev - 1);
      setLikeId(null);
    } else {
      // Like: Store new document with `likeId`
      await setDoc(likeRef, { userId: user.uid, liked: true });
      await setDoc(userRef, { likedBeats: arrayUnion(newLikeId) }, { merge: true });

      setLike(true);
      setLikeCount((prev) => prev + 1);
      setLikeId(newLikeId); // Store the generated likeId
    }
  };

  return (
    <div onClick={handleLike} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
      <FaHeart size={size} color={like ? "red" : "gray"} />
      <div style={{ marginLeft: "5px" }}>{likeCount}</div>
    </div>
  );
};

export default LikeButton;