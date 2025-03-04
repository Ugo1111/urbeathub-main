import React, { useState, useEffect } from "react";
import { TbSend } from "react-icons/tb";
import { IoIosContact } from "react-icons/io";
import { Profilepicture } from "../AuthState"; // Assuming this is being used
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    startAfter,
    limit,
    doc,
    deleteDoc,
    getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore"; // Import Firestore Timestamp
import { formatDistanceToNow } from "date-fns";

function Comment({ song, comments, setComments }) {
    const [newComment, setNewComment] = useState("");
    const [lastVisible, setLastVisible] = useState(null); // Track the last visible comment for pagination
    const [loading, setLoading] = useState(false); // Track if comments are loading
    const [showLoadMore, setShowLoadMore] = useState(false); // Control "Load More" button visibility

    // Add new comment to Firestore
    const addComment = async () => {
        if (newComment.trim()) {
            const db = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("Please log in to post a comment.");
                return;
            }

            try {
                // Fetch the username from Firestore using the user's email
                const userRef = doc(db, "beatHubUsers", user.email); // Assuming the user is stored with email as the document ID
                const userSnap = await getDoc(userRef);

                let username = "Anonymous"; // Default fallback username
                let displayName = "Anonymous"; // Default fallback username

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    username = userData.username || "Anonymous"; // Use the stored username or fallback to "Anonymous"
                    displayName = userRef.displayName;
                }

                // Add comment to Firestore with Firestore Timestamp
                const commentRef = collection(db, `beats/${song.id}/comments`);
                const docRef = await addDoc(commentRef, {
                    text: newComment,
                    userId: user.uid,
                    displayName: username, // Use the fetched username here
                    createdAt: Timestamp.now(), // Store creation time as Firestore Timestamp
                });

                // Update local comments state
                setComments((prevComments) => [
                    ...prevComments,
                    {
                        id: docRef.id,
                        text: newComment,
                        userId: user.uid,
                        displayName: username,
                        createdAt: Timestamp.now(), // Store creation time in local state as Firestore Timestamp
                    },
                ]);
                setNewComment(""); // Clear input field
                alert("Your comment has been posted successfully!");
            } catch (error) {
                console.error("Error adding comment: ", error);
            }
        }
    };

    // Fetch initial comments (limit to 7)
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            const db = getFirestore();
            const commentRef = collection(db, `beats/${song.id}/comments`);
            const q = query(commentRef, orderBy("createdAt", "desc"), limit(7));

            const querySnapshot = await getDocs(q);
            const fetchedComments = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments(fetchedComments);

            // Get the last visible document for pagination
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

            setLoading(false);
            setShowLoadMore(querySnapshot.docs.length === 7); // Show "Load More" if there are more comments
        };

        if (song?.id) {
            fetchComments();
        }
    }, [song?.id]);

    // Fetch more comments when "Load More" is clicked
    const loadMoreComments = async () => {
        setLoading(true);
        const db = getFirestore();
        const commentRef = collection(db, `beats/${song.id}/comments`);
        const q = query(
            commentRef,
            orderBy("createdAt", "asc"),
            startAfter(lastVisible),
            limit(7) // Fetch the next batch of 7 comments
        );

        const querySnapshot = await getDocs(q);
        const moreComments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setComments((prevComments) => [...prevComments, ...moreComments]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

        setShowLoadMore(querySnapshot.docs.length === 7);

        setLoading(false);
    };

    // Delete comment from Firestore
    const deleteComment = async (commentId) => {
        const db = getFirestore();
        const commentRef = doc(db, `beats/${song.id}/comments`, commentId);

        try {
            await deleteDoc(commentRef);
            setComments((prevComments) =>
                prevComments.filter((comment) => comment.id !== commentId)
            );
        } catch (error) {
            console.error("Error deleting comment: ", error);
        }
    };

    return (
        <section className="comment">
            <h1>Comments</h1>
            <div className="add-comment">
                <Profilepicture />
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                />
                <button onClick={addComment}>
                    <TbSend className="send-icon" />
                </button>
            </div>
            <div className="comments-list">
                {comments.map((comment, idx) => {
                    // Calculate relative time for each comment
                    let relativeTime = "N/A";
                    if (comment.createdAt) {
                        let jsDate;
                        if (comment.createdAt instanceof Timestamp) {
                            jsDate = comment.createdAt.toDate();
                        } else if (typeof comment.createdAt === "object" && comment.createdAt.seconds) {
                            jsDate = new Date(comment.createdAt.seconds * 1000);
                        }
                        if (jsDate) {
                            relativeTime = formatDistanceToNow(jsDate, { addSuffix: true });
                        }
                    }
                    return (
                        <div className="comments-list-container" key={idx}>
                            {/* Check if profilePicture exists */}
                            {comment.profilePicture ? (
                                <img
                                    src={comment.profilePicture}
                                    className="commentImage"
                                    alt="Profile"
                                />
                            ) : (
                                <IoIosContact size={"2.5em"} /> // If no profile picture, display the Profilepicture component
                            )}
                            <div className="commentWrapper">
                                <div>{comment.displayName} <span className="comment-date">{relativeTime}</span></div> {/* Display the username here */}
                                <p>{comment.text}</p>
                                {/* Show delete button if the comment belongs to the current user */}
                                {comment.userId === getAuth().currentUser?.uid && (
                                    <button
                                        onClick={() => deleteComment(comment.id)}
                                        className="delete-comment-btn"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Load More button */}
            {showLoadMore && !loading && (
                <button onClick={loadMoreComments} className="load-more-btn">
                    Load More
                </button>
            )}
            {loading && <p>Loading...</p>}
        </section>
    );
}

export default Comment;
