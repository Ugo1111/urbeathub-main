import React, { useState, useEffect } from "react";
import "../css/BeatUploadPopup.css";

const BeatUploadPopup = ({ user }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(0);
  const [showWavUpload, setShowWavUpload] = useState(false);
  const [form, setForm] = useState({
    coverArt: null,
    title: "",
    mp3: null,
    wav: null,
    stems: null,
    price: "",
    genre: "",
    mood: "",
    bpm: "",
    instrument: "",
  });

  const stepLabels = ["Start", "Upload", "Complete"];

  useEffect(() => {
    const skip = sessionStorage.getItem("skipPopup");
    const timeout = setTimeout(() => {
      if (!skip) setShowPopup(true);
    }, 6000);
    return () => clearTimeout(timeout);
  }, []);

  const handleNext = () => setStep((s) => s + 1);
  const handleClose = () => {
    setShowPopup(false);
    setTimeout(() => setShowPopup(true), 6000);
  };
  const handleSkipSession = () => {
    sessionStorage.setItem("skipPopup", "true");
    setShowPopup(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAskWav = () => {
    const confirmWav = window.confirm("Do you want to upload a WAV version?");
    if (confirmWav) setShowWavUpload(true);
    else handleNext();
  };

  if (!showPopup || !user) return null;

  return (
    <div className="beat-popup">
      <div className="popup-box">
        {/* Step Tracker */}
        <div className="step-tracker">
          {stepLabels.map((label, index) => (
            <div className="tracker-step" key={index}>
              <div className={`step-circle ${step === index ? "active" : ""}`}>
                {index + 1}
              </div>
              <div className="step-label">{label}</div>
              {index < stepLabels.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Step 0 - Start */}
        {step === 0 && (
          <>
            <p>🎶 I’m BeatHub Assistant—let’s upload your beat and make magic happen!</p>
            <input
              name="mood"
              placeholder="Mood"
              onChange={handleChange}
            />
            <input
              name="genre"
              placeholder="Genre"
              onChange={handleChange}
            />
            <div className="popup-upload">
              <button  onClick={handleNext}>Continue</button>
              <button onClick={handleClose}>No</button>

            </div>
          </>
        )}

        {/* Step 1 - Upload + Info */}
        {step === 1 && (
          <>
            <p>📝 Beat Info</p>
            <input
              type="number"
              name="price"
              placeholder="Price ($)"
              onChange={handleChange}
            />

            <input
              type="text"
              name="title"
              placeholder="Beat Title"
              onChange={handleChange}
            />
            
            <input
              name="bpm"
              type="number"
              placeholder="BPM"
              onChange={handleChange}
            />
            
            <p>📁 Upload MP3</p>
            <input
              type="file"
              name="mp3"
              accept=".mp3"
              onChange={handleChange}
            />

            {form.mp3 && !showWavUpload && (
              <button onClick={handleAskWav}>Next</button>
            )}

            {showWavUpload && (
              <>
                <p>📁 Upload WAV</p>
                <input
                  type="file"
                  name="wav"
                  accept=".wav"
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="WAV Price ($)"
                  onChange={handleChange}
                />
                <button onClick={handleNext}>Next</button>
              </>
            )}
          </>
        )}

        {/* Step 2 - Done */}
        {step === 2 && (
          <>
            <p>✅ Your beat will be live in the next 12 hours!</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default BeatUploadPopup;
