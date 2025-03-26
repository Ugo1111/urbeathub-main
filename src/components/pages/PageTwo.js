import React, { useState } from "react";

const AudioTagger = () => {
  // State to store the URL of the processed audio for playback
  const [audioSrc, setAudioSrc] = useState(null); 
  // State to store the download link for the processed audio file
  const [downloadLink, setDownloadLink] = useState(null); 

  // Function to handle file upload and processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (!file) return; // Exit if no file is selected

    // Create an AudioContext for processing the audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
      // Read the uploaded audio file into an ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      // Decode the audio file into an AudioBuffer
      const decodedFileAudio = await audioContext.decodeAudioData(fileArrayBuffer);

      // Load the watermark audio file from the public folder
      const watermarkBuffer = await loadWatermarkAudio(audioContext);

      // Mix the uploaded audio with the watermark
      const mixedBuffer = mixAudioWithWatermark(audioContext, decodedFileAudio, watermarkBuffer);

      // Export the mixed audio as a WAV file
      const wavBlob = exportAudioToWav(audioContext, mixedBuffer);

      // Create a URL for the processed audio file
      const wavURL = URL.createObjectURL(wavBlob);
      setAudioSrc(wavURL); // Set the URL for playback
      setDownloadLink(wavURL); // Set the URL for downloading the file
    } catch (error) {
      console.error("Error processing the MP3 file:", error); // Handle errors
    }
  };

  // Function to load the watermark audio file
  const loadWatermarkAudio = async (audioContext) => {
    // Fetch the watermark audio from the public folder
    const response = await fetch("/BEATHUB WATERMARK NEW.mp3");
    const arrayBuffer = await response.arrayBuffer(); // Convert to an ArrayBuffer
    return await audioContext.decodeAudioData(arrayBuffer); // Decode into an AudioBuffer
  };

  // Function to mix the original audio with the watermark
  const mixAudioWithWatermark = (audioContext, originalBuffer, watermarkBuffer) => {
    const mixedLength = originalBuffer.length; // Get the length of the original audio
    // Create a new audio buffer to store the mixed audio
    const outputBuffer = audioContext.createBuffer(
      originalBuffer.numberOfChannels,
      mixedLength,
      originalBuffer.sampleRate
    );

    // Loop through each audio channel
    for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
      const originalData = originalBuffer.getChannelData(channel); // Get original audio data
      const outputData = outputBuffer.getChannelData(channel); // Get output buffer data
      const watermarkData = watermarkBuffer.getChannelData(0); // Get watermark audio data

      // Copy the original audio data to the output buffer
      outputData.set(originalData);

      // Define the interval for inserting the watermark (every 30 seconds)
      const interval = originalBuffer.sampleRate * 30;
      for (let i = 0; i < mixedLength; i++) {
        // Add watermark at intervals
        if (i % interval < watermarkBuffer.length) {
          outputData[i] += watermarkData[i % watermarkBuffer.length] * 0.5; // Reduce volume of watermark
        }
      }
    }
    return outputBuffer; // Return the mixed audio buffer
  };

  // Function to export the mixed audio as a WAV file
  const exportAudioToWav = (audioContext, audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels; // Get number of audio channels
    const sampleRate = audioBuffer.sampleRate; // Get sample rate
    const format = 1; // PCM format
    const bitDepth = 16; // 16-bit audio
    const samples = audioBuffer.length * numChannels; // Calculate total samples
    // Create an ArrayBuffer for storing WAV file data
    const wavBuffer = new ArrayBuffer(44 + samples * (bitDepth / 8));
    const view = new DataView(wavBuffer);

    let offset = 0;

    // Helper function to write a string into the DataView
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    // Write WAV file headers
    writeString("RIFF"); // RIFF chunk descriptor
    view.setUint32(offset, 36 + samples * (bitDepth / 8), true); // File size
    offset += 4;
    writeString("WAVE"); // WAV format
    writeString("fmt "); // Format chunk
    view.setUint32(offset, 16, true); // Subchunk size (PCM)
    offset += 4;
    view.setUint16(offset, format, true); // Audio format (1 = PCM)
    offset += 2;
    view.setUint16(offset, numChannels, true); // Number of channels
    offset += 2;
    view.setUint32(offset, sampleRate, true); // Sample rate
    offset += 4;
    view.setUint32(offset, sampleRate * numChannels * (bitDepth / 8), true); // Byte rate
    offset += 4;
    view.setUint16(offset, numChannels * (bitDepth / 8), true); // Block align
    offset += 2;
    view.setUint16(offset, bitDepth, true); // Bits per sample
    offset += 2;
    writeString("data"); // Data chunk
    view.setUint32(offset, samples * (bitDepth / 8), true); // Data size
    offset += 4;

    // Write audio data
    for (let sample = 0; sample < audioBuffer.length; sample++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sampleData = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[sample])); // Normalize sample
        view.setInt16(offset, sampleData * (0x7fff), true); // Convert to 16-bit PCM
        offset += 2;
      }
    }

    // Return the WAV file as a Blob
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  return (
    <div>
      <h1>MP3 Audio Watermarker</h1>
      {/* File input for uploading an MP3 file */}
      <input type="file" accept="audio/mp3" onChange={handleFileUpload} />
      <br />
      <br />
      {/* Display audio player if the processed file is available */}
      {audioSrc && (
        <div>
          <h3>Preview Watermarked Audio:</h3>
          <audio controls src={audioSrc}></audio>
        </div>
      )}
      {/* Display download link if processed file is available */}
      {downloadLink && (
        <div>
          <a href={downloadLink} download="watermarked_audio.wav">
            Download Watermarked Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default AudioTagger;