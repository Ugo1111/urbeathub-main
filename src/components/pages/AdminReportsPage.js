import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // Import date-fns for relative time
import "../css/adminReportsPage.css"; // Import CSS for styling

const AdminReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const db = getFirestore();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "beats"));
                const reportsList = [];

                for (const doc of querySnapshot.docs) {
                    const beatData = doc.data();
                    const reportsSnapshot = await getDocs(collection(db, `beats/${doc.id}/reports`));
                    reportsSnapshot.forEach((reportDoc) => {
                        reportsList.push({
                            id: reportDoc.id,
                            beatId: doc.id,
                            beatTitle: beatData.title,
                            ...reportDoc.data(),
                        });
                    });
                }

                setReports(reportsList);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [db]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="reports-container">
            <h1>Reports</h1>
            <ul className="reports-list">
                {reports.map((report) => (
                    <li key={report.id} className="report-item">
                        <p><strong>Beat Title:</strong> {report.beatTitle}</p>
                        <p><strong>Reason:</strong> {report.reason}</p>
                        <p><strong>Comment:</strong> {report.comment}</p>
                        <p><strong>Timestamp:</strong> {formatDistanceToNow(new Date(report.timestamp.seconds * 1000), { addSuffix: true })}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminReportsPage;
