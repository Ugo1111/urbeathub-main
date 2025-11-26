import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Follow or unfollow a producer.
 * Returns true if now following, false if now unfollowed.
 */
export async function toggleFollowUser(db, producerId) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be logged in to follow.");
  }

  const userId = currentUser.uid;

  const producerSocialRef = doc(db, "Social", producerId);
  const userSocialRef = doc(db, "Social", userId);

  // Ensure documents exist
  const producerSnap = await getDoc(producerSocialRef);
  const userSnap = await getDoc(userSocialRef);

  if (!producerSnap.exists()) {
    await setDoc(producerSocialRef, { followers: [], following: [] });
  }
  if (!userSnap.exists()) {
    await setDoc(userSocialRef, { followers: [], following: [] });
  }

  const producerData = (await getDoc(producerSocialRef)).data();
  const userData = (await getDoc(userSocialRef)).data();

  const followers = producerData.followers || [];
  const alreadyFollowing = followers.includes(userId);

  if (alreadyFollowing) {
    // Unfollow
    await updateDoc(producerSocialRef, {
      followers: arrayRemove(userId),
    });
    await updateDoc(userSocialRef, {
      following: arrayRemove(producerId),
    });
    return false; // now unfollowed
  } else {
    // Follow
    await updateDoc(producerSocialRef, {
      followers: arrayUnion(userId),
    });
    await updateDoc(userSocialRef, {
      following: arrayUnion(producerId),
    });
    return true; // now following
  }
}