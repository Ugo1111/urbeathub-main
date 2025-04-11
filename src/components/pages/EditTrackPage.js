import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, storage } from "../../firebase/firebase"; // Import Firestore & Storage
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions
import { IoReturnUpBackSharp } from "react-icons/io5";

const EditTrackPage = () => {
  const location = useLocation();
  const item = location.state?.item || {};
  const [trackData, setTrackData] = useState(item);
  const [isEditing, setIsEditing] = useState(true);
  const [newImage, setNewImage] = useState(null);
  const [newMp3, setNewMp3] = useState(null);
  const [newWav, setNewWav] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
  
    setTrackData((prev) => {
      let updatedData = { ...prev };
  
      let ref = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = ref[keys[i]] || {};
        ref = ref[keys[i]];
      }
  
      ref[keys[keys.length - 1]] = type === "checkbox" ? checked : (type === "number" ? Number(value) : value);
  
      return updatedData;
    });
  };

  const handleChangeTag = (e) => {
    const { name, value } = e.target;
  
    // Check if the field is "metadata.tags"
    if (name === "metadata.tags") {
      // Split the tags by commas and trim any extra spaces
      let tagsArray = value.split(",").map(tag => tag.trim());
  
      // Limit the tags to a maximum of 3
      if (tagsArray.length > 3) {
        tagsArray = tagsArray.slice(0, 3); // Take only the first 3 tags
      }
  
      // Update the state with the limited number of tags
      setTrackData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: tagsArray, // Update the tags field
        },
      }));
    } else {
      // Handle other fields
      const keys = name.split(".");
      setTrackData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    }
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  // Handle Audio Selection
  const handleAudioChange = (e, type) => {
    type === "mp3" ? setNewMp3(e.target.files[0]) : setNewWav(e.target.files[0]);
  };

  // Upload & Save Data
  const handleSave = async () => {
    setLoading(true);
    try {
      let newImageUrl = trackData.coverUrl;
      let newMp3Url = trackData.musicUrls?.mp3;
      let newWavUrl = trackData.musicUrls?.wav;
  
      // Upload new image if selected
      if (newImage) {
        const imageRef = ref(storage, `beat_covers/${trackData.id}`);
        await uploadBytes(imageRef, newImage);
        newImageUrl = await getDownloadURL(imageRef);
      }
  
      // Upload new MP3 if selected
      if (newMp3) {
        const mp3Ref = ref(storage, `beat_audio/${trackData.id}/audio.mp3`);
        await uploadBytes(mp3Ref, newMp3);
        newMp3Url = await getDownloadURL(mp3Ref);
      }
  
      // Upload new WAV if selected
      if (newWav) {
        const wavRef = ref(storage, `beat_audio/${trackData.id}/audio.wav`);
        await uploadBytes(wavRef, newWav);
        newWavUrl = await getDownloadURL(wavRef);
      }
  
      // Prepare updated data
      const updatedData = {
        ...trackData,
        coverUrl: newImageUrl,
        musicUrls: { mp3: newMp3Url, wav: newWavUrl },
      };
  
      // Update Firestore
      const trackRef = doc(db, "beats", trackData.id);
      await updateDoc(trackRef, updatedData);
  
      // Immediately update local state to reflect changes
      setTrackData(updatedData);
  
      // Reset file input states
      setNewImage(null);
      setNewMp3(null);
      setNewWav(null);
  
      alert("Track updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating track:", error);
      alert("Failed to update track.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = (type) => {
    setTrackData((prev) => ({
      ...prev,
      monetization: {
        ...prev.monetization,
        [type]: {
          ...prev.monetization?.[type],
          enabled: !prev.monetization?.[type]?.enabled, // Toggle enabled
        },
      },
    }));
  };

  const navigate = useNavigate();

  const handleBack = () => {
    // Go back one step, or redirect to the home page if there's no history
    if (window.history.length > 1) {
      navigate(-1); // If there is history, go back to the previous page
    } else {
      navigate('/'); // Otherwise, go to the home page or another fallback route
    }
  };

  return (
    <div className="ViewEditSellBeatPage-body">
      <button onClick={handleBack} className="ViewEditSellBeatPage-goBack"> <IoReturnUpBackSharp />Go Back</button>
      <div className="track-container">
        <h1>Track Details</h1>

        <div className="track-info">
          <label>Title:</label>
          {isEditing ? (
            <input type="text" name="title" value={trackData.title || ""} onChange={handleChange} />
          ) : (
            <p>{trackData.title}</p>
          )}

          <label>Uploaded By:</label>
          <p>{trackData.uploadedBy || "N/A"}</p>

          <label>Timestamp:</label>
          <p>{trackData.timestamp?.seconds ? new Date(trackData.timestamp.seconds * 1000).toLocaleString() : "N/A"}</p>

          <label>Status:</label>
          {isEditing ? (
            <select name="status" value={trackData.status} onChange={handleChange}>
              <option value={true}>Published</option>
              <option value={false}>Unpublished</option>
            </select>
          ) : (
            <p>{trackData.status ? "Published" : "Unpublished"}</p>
          )}

          <label>Cover Image:</label>
          {trackData.coverUrl && <img src={trackData.coverUrl} alt="Cover Art" className="cover-img" />}
          {isEditing && <input type="file" accept="image/*" onChange={handleImageChange} />}

          <h2>Metadata</h2>
          {["bpm", "genres", "instruments", "key", "moods"].map((field) => (
            <div key={field}>
              <label>{field.toUpperCase()}:</label>
              {isEditing ? (
                <input type="text" name={`metadata.${field}`} value={trackData.metadata?.[field] || ""} onChange={handleChange} />
              ) : (
                <p>{trackData.metadata?.[field] || "N/A"}</p>
              )}
            </div>
          ))}

          <div>
            <label>TAGS:</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="metadata.tags"
                  value={trackData.metadata?.tags?.join(", ") || ""}
                  onChange={handleChangeTag}
                  placeholder="Enter up to 3 tags, separated by commas"
                />
                {trackData.metadata?.tags?.length >= 3 && (
                  <p style={{ color: "red" }}>You can only add up to 3 tags.</p>
                )}
              </>
            ) : (
              <p>{(Array.isArray(trackData.metadata?.tags) ? trackData.metadata?.tags.join(", ") : "No tags available") || "No tags available"}</p>
            )}
          </div>

          <h2>Audio Files</h2>
          <label>MP3:</label>
          {isEditing ? (
            <input type="file" accept="audio/mpeg" onChange={(e) => handleAudioChange(e, "mp3")} />
          ) : (
            trackData.musicUrls?.mp3 && <audio controls src={trackData.musicUrls.mp3} />
          )}

          <label>WAV:</label>
          {isEditing ? (
            <input type="file" accept="audio/wav" onChange={(e) => handleAudioChange(e, "wav")} />
          ) : (
            trackData.musicUrls?.wav && <audio controls src={trackData.musicUrls.wav} controls preload="none" />
          )}

          <div>
            <h2>Monetization</h2>

            {["basic", "exclusive", "premium", "unlimited"].map((type) => (
              <div key={type} className="monetization-item">
                <label>{type.charAt(0).toUpperCase() + type.slice(1)}:</label>
                
                {isEditing ? (
                  <>
                    {/* Toggle enabled/disabled */}
                    <input
                      type="checkbox"
                      checked={trackData.monetization?.[type]?.enabled || false}
                      onChange={() => handleToggleEnabled(type)}
                    />
                    <span>{trackData.monetization?.[type]?.enabled ? "Enabled" : "Disabled"}</span>

                    {/* Show price input only if enabled */}
                    {trackData.monetization?.[type]?.enabled && (
                      <input
                        type="number"
                        name={`monetization.${type}.price`}
                        value={trackData.monetization?.[type]?.price || ""}
                        onChange={handleChange}
                      />
                    )}
                  </>
                ) : (
                  <p>
                    {trackData.monetization?.[type]?.enabled
                      ? `$${trackData.monetization?.[type]?.price}`
                      : "Disabled"}
                  </p>
                )}
              </div>
            ))}

            {/* Special Case: Free Monetization (No Price) */}
            <div className="monetization-item">
              <label>Free:</label>
              
              {isEditing ? (
                <>
                  <input
                    type="checkbox"
                    checked={trackData.monetization?.free?.enabled || false}
                    onChange={() => handleToggleEnabled("free")}
                  />
                  <span>{trackData.monetization?.free?.enabled ? "Enabled" : "Disabled"}</span>
                </>
              ) : (
                <p>{trackData.monetization?.free?.enabled ? "Enabled" : "Disabled"}</p>
              )}
            </div>
          </div>

          {isEditing ? (
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
        
        <button className="ViewEditSellBeatPage-gack-btn" onClick={handleBack}>Go Back</button>
      </div>
    </div>
  );
};

export default EditTrackPage;
