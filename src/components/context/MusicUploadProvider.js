// src/context/MusicUploadContext.js
import React, { createContext, useState, useContext } from "react";

// Create a Context for the shared state
const MusicUploadContext = createContext();

export const useMusicUploadContext = () => useContext(MusicUploadContext);

// Create a provider component to wrap the rest of your app
export const MusicUploadProvider = ({ children }) => {
    
      const [beatId, setBeatId] = useState("");
      const [musicTitle, setMusicTitle] = useState("");
      const [coverPreview, setCoverPreview] = useState(null);
       const [audioFileMp3, setAudioFileMp3] = useState(null);
       const [audioFileWav, setAudioFileWav] = useState(null);
       const [coverArt, setCoverArt] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState({
    mp3: null,
    wave: null,
    coverArt: null,
    title: null,
  });
  const [metadata, setMetadata] = useState({ tags: [] });
  const [monetization, setMonetization] = useState({
    basic: { enabled: true, price: 10 },
    premium: { enabled: true, price: 10 },
    unlimited: { enabled: true, price: 30 },
    exclusive: { enabled: true, price: 50 },
    free: { enabled: false, price: 0 },
  });

  const [uploadMusic, setUploadMusic] = useState(null);
  const [handleSubmit, setHandleSubmit] = useState(null);
  const [handlePublish, setHandlePublish] = useState(null);
  // This value will be accessible by all components wrapped in MusicUploadProvider
  const value = {
    coverPreview, setCoverPreview,audioFileMp3, setAudioFileMp3,audioFileWav, setAudioFileWav,coverArt, setCoverArt,beatId,setBeatId,
    musicTitle,
    setMusicTitle,
    selectedMusic,
    setSelectedMusic,
    metadata,
    setMetadata,
    monetization,
    setMonetization,
    handlePublish, 
    setHandlePublish ,handleSubmit, setHandleSubmit,uploadMusic, setUploadMusic,
  };

  return (
    <MusicUploadContext.Provider value={value}>
      {children}
    </MusicUploadContext.Provider>
  );
};