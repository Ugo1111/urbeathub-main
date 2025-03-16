import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for relative time
import "../css/adminNegotiationsPage.css"; // Import CSS for styling

const AdminNegotiationsPage = () => {
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const db = getFirestore();

    useEffect(() => {
        const fetchNegotiations = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "negotiations"));
                const negotiationsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNegotiations(negotiationsList);
            } catch (error) {
                console.error("Error fetching negotiations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNegotiations();
    }, [db]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="negotiations-container">
            <h1>Negotiations</h1>
            <ul className="negotiations-list">
                {negotiations.map((negotiation) => (
                    <li key={negotiation.id} className="negotiation-item">
                        <p><strong>Song:</strong> {negotiation.songTitle}</p>
                        <p><strong>License:</strong> {negotiation.license}</p>
                        <p><strong>Amount:</strong> ${negotiation.amount}</p>
                        <p><strong>Submitted by User ID:</strong> {negotiation.userId}</p>
                        <p><strong>User Email:</strong> {negotiation.userEmail}</p>
                        <p><strong>Timestamp:</strong> {formatDistanceToNow(new Date(negotiation.timestamp.seconds * 1000), { addSuffix: true })}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminNegotiationsPage;
