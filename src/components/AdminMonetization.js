import React, { useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useMusicUploadContext } from "../context/MusicUploadProvider";

const AdminMonetization = () => {
  const { monetization, setMonetization, beatId, setHandlePublish } = useMusicUploadContext();

  // Use setDoc to ensure only ONE document is created
  const handlePublish = useCallback(async () => {
    if (!beatId) {
      alert("Beat ID is not set yet. Please try again in a few seconds.");
      return;
    }

    try {
      // Store all monetization data in a single document with a fixed ID
      const monetizationRef = doc(db, `beats/${beatId}`);
      await updateDoc(monetizationRef, { monetization }); // This updates instead of creating new IDs

      alert("Monetization data published successfully!");
    } catch (error) {
      console.error("Error publishing monetization data:", error);
      alert("Failed to publish monetization data.");
    }
  }, [beatId, monetization]); // Only updates when beatId or monetization changes

  // Ensure handlePublish is set so other components can call it
  useEffect(() => {
    setHandlePublish(() => handlePublish);
  }, [setHandlePublish, handlePublish]);

  const toggleLicense = (license) => {
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
          <button onClick={() => toggleLicense(key)}>
            {enabled ? "On ✅" : "Off ❌"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminMonetization;
