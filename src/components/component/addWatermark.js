const addWatermark = async (audioFile) => {
  const watermarkUrl = "/BEATHUB WATERMARK NEW.mp3";
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const fetchAudioBuffer = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
  };

  const audioBuffer = await fetchAudioBuffer(audioFile);
  const watermarkBuffer = await fetchAudioBuffer(watermarkUrl);

  const outputBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);

    for (let sample = 0; sample < audioBuffer.length; sample++) {
      outputData[sample] = inputData[sample];
    }

    for (let sample = 0; sample < audioBuffer.length; sample += audioBuffer.sampleRate * 30) {
      for (let watermarkSample = 0; watermarkSample < watermarkBuffer.length; watermarkSample++) {
        if (sample + watermarkSample < audioBuffer.length) {
          outputData[sample + watermarkSample] += watermarkBuffer.getChannelData(channel)[watermarkSample];
        }
      }
    }
  }

  const outputBlob = new Blob([outputBuffer], { type: "audio/mp3" });
  return URL.createObjectURL(outputBlob);
};

export default addWatermark;
