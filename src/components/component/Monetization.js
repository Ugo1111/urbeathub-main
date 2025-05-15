import React, { useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useMusicUploadContext } from "../context/MusicUploadProvider";
import { HiOutlineInformationCircle } from "react-icons/hi";


const LICENSE_DESCRIPTIONS = {
  basic: `Receive a High Quality MP3
Use It Commercially
Sell Up To 5,000 Copies
Available For 10,000 Streams
No YouTube Monetization
Must Credit Ur BeatHub`,

  premium: `Receive MP3 + WAV files
Sell Up To 10,000 Copies
Up to 100,000 Streams
Monetize on YouTube
Must Credit Ur BeatHub`,

  unlimited: `Receive HQ MP3, WAV & Trackouts
Use It Commercially
Sell Up To 20,000 Copies
Limited to 100,000 Streams
YT Monetization + 1 Music Video
Must Credit Ur BeatHub`,

  exclusive: `All rights transferred to you
Unlimited sales, streams, monetization
No credit required
Beat is removed from store
Best for artists wanting ownership`,

  free: `Free download for non-commercial use
Streaming only
Must credit Ur BeatHub
No monetization rights`,
};

const Monetization = () => {
    const { monetization, setMonetization, beatId, setHandlePublish } = useMusicUploadContext();

    // 🛠️ Use setDoc to ensure only ONE document is created
    const handlePublish = useCallback(async () => {
        if (!beatId) {
            alert("Beat ID is not set yet. Please try again in a few seconds.");
            return;
        }

        try {
            // Store all monetization data in a single document with a fixed ID
            const monetizationRef = doc(db, `beats/${beatId}`);
            await updateDoc(monetizationRef, {"monetization": monetization}); // This updates instead of creating new IDs

            alert("Monetization data published successfully!");
        } catch (error) {
            console.error("Error publishing monetization data:", error);
            alert("Failed to publish monetization data.");
        }
    }, [beatId, monetization]); // Only updates when beatId or monetization changes

    // ✅ Ensure handlePublish is set so other components can call it
    useEffect(() => {
        setHandlePublish(() => handlePublish);
    }, [setHandlePublish, handlePublish]);

    const toggleLicense = (license, event) => {
        event.preventDefault(); // Prevent default behavior
        setMonetization((prev) => ({
            ...prev,
            [license]: { ...prev[license], enabled: !prev[license].enabled },
        }));
    };

    const handlePriceChange = (license, value) => {
        setMonetization((prev) => ({
            ...prev,
            [license]: { ...prev[license], price: parseFloat(value) || 0 },
        }));
    };

    return (
        <div>
            <h2>Non-Exclusive Licenses</h2>

            {Object.entries(monetization).map(([key, { enabled, price }]) => (
                <div key={key} className="Basic-License">
                    <div>{key.charAt(0).toUpperCase() + key.slice(1)} License</div>
                    <div className="tooltip">
              <span style={{ cursor: "pointer" }}>< HiOutlineInformationCircle /></span>
              <span className="tooltip-text">{LICENSE_DESCRIPTIONS[key]}</span>
            </div>
                    {key !== "free" && (
                        <div>
                            <label>Price:</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => handlePriceChange(key, e.target.value)}
                            />
                        </div>
                    )}
                    <button onClick={(e) => toggleLicense(key, e)}>
                        {enabled ? "On ✅" : "Off ❌"}
                    </button>
                </div>
            ))}

            {/* <button className="publish-button" onClick={handlePublish}>
                Publish Track
            </button> */}
        </div>
    );
};

export default Monetization;
