import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useMusicUploadContext } from "../context/MusicUploadProvider";

const Metadata = ({ metadata = {}, setMetadata }) => {
    const [localMetadata, setLocalMetadata] = useState(metadata);
    const { setHandleSubmit, beatId } = useMusicUploadContext();

    useEffect(() => {
        setLocalMetadata(metadata);
    }, [metadata]);

    const handleInputChange = (field, value) => {
        setLocalMetadata(prev => ({ ...prev, [field]: value }));
        setMetadata(prev => ({ ...prev, [field]: value }));
    };

    const handleTagInput = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            let newTag = e.target.value.trim();
            if (newTag && !localMetadata.tags?.includes(newTag)) {
                if (localMetadata.tags?.length < 3) {
                    const updatedTags = [...(localMetadata.tags || []), newTag];
                    handleInputChange("tags", updatedTags);
                } else {
                    alert("You can only add up to 3 tags.");
                }
            }
            e.target.value = "";
        }
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = localMetadata.tags?.filter(tag => tag !== tagToRemove);
        handleInputChange("tags", updatedTags);
    };

    // ✅ Optimized: Wrapped `handleSubmit` in `useCallback` to prevent unnecessary re-registrations
    const handleSubmit = useCallback(async () => {
        if (!beatId) {
            alert("Beat ID is missing. Please wait and try again.");
            return;
        }

        try {
            const beatDocRef = doc(db, "beats", beatId);
            await updateDoc(beatDocRef, {
                metadata: localMetadata,
                updatedAt: new Date(),
            });

            alert("Metadata updated successfully!");
        } catch (error) {
            console.error("Error updating metadata:", error);
            alert("Failed to update metadata.");
        }
    }, [beatId, localMetadata]);

    // ✅ Only set `handleSubmit` if `beatId` is valid
    useEffect(() => {
        if (beatId) {
            setHandleSubmit(() => handleSubmit);
        }
    }, [setHandleSubmit, handleSubmit, beatId]);

    return (
        <div>
            {/* Tags */}
            <div className="Metadata-Fields">
                <label>Tags:</label>
                <div className="tag-container">
                    {localMetadata.tags?.map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                            <button className="remove-tag" onClick={() => removeTag(tag)}>×</button>
                        </span>
                    ))}
                    {localMetadata.tags?.length < 3 && (
                        <input type="text" onKeyDown={handleTagInput} placeholder="Enter up to 3 tags" />
                    )}
                </div>
            </div>

            {/* Genres */}
            <div className="Metadata-Fields">
                <label>Genres:</label>
                <input type="text" value={localMetadata.genres || ""} onChange={(e) => handleInputChange("genres", e.target.value)} />
            </div>

            {/* Key & BPM */}
            <div className="BPM-Key">
                <div className="BPM-Key2">
                    <label>Key:</label>
                    <input type="text" value={localMetadata.key || ""} onChange={(e) => handleInputChange("key", e.target.value)} />
                </div>
                <div className="BPM-Key2">
                    <label>BPM:</label>
                    <input type="number" value={localMetadata.bpm || ""} onChange={(e) => handleInputChange("bpm", e.target.value)} />
                </div>
            </div>

            {/* Instruments */}
            <div className="Metadata-Fields">
                <label>Instruments:</label>
                <input type="text" value={localMetadata.instruments || ""} onChange={(e) => handleInputChange("instruments", e.target.value)} />
            </div>

            {/* Moods */}
            <div className="Metadata-Fields">
                <label>Moods:</label>
                <input type="text" value={localMetadata.moods || ""} onChange={(e) => handleInputChange("moods", e.target.value)} />
            </div>

            {/* Submit Button */}
            {/* <button className="submit-button" onClick={handleSubmit}>Submit Metadata</button> */}
        </div>
    );
};

export default Metadata;