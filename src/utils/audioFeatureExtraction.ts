export interface AudioFeatures {
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlatness: number;
  rmsEnergy: number;
  zeroCrossingRate: number;
  lowFreqEnergy: number;
  midFreqEnergy: number;
  highFreqEnergy: number;
  duration: number;
}

export const extractAudioFeatures = async (audioBuffer: AudioBuffer): Promise<AudioFeatures> => {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // Perform FFT analysis
  const fftSize = 2048;
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(analyser);

  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  // Calculate spectral centroid (brightness)
  let weightedSum = 0;
  let magnitudeSum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    const frequency = (i * sampleRate) / fftSize;
    const magnitude = frequencyData[i];
    weightedSum += frequency * magnitude;
    magnitudeSum += magnitude;
  }
  const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

  // Calculate spectral rolloff (high frequency content)
  const rolloffThreshold = 0.85;
  let cumulativeEnergy = 0;
  const totalEnergy = frequencyData.reduce((sum, val) => sum + val * val, 0);
  let rolloffBin = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    cumulativeEnergy += frequencyData[i] * frequencyData[i];
    if (cumulativeEnergy >= rolloffThreshold * totalEnergy) {
      rolloffBin = i;
      break;
    }
  }
  const spectralRolloff = (rolloffBin * sampleRate) / fftSize;

  // Calculate spectral flatness (noise vs tonal)
  const geometricMean = Math.exp(
    frequencyData.reduce((sum, val) => sum + Math.log(val + 1), 0) / frequencyData.length
  );
  const arithmeticMean = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
  const spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;

  // Calculate RMS energy
  const rmsEnergy = Math.sqrt(
    channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length
  );

  // Calculate zero crossing rate
  let zeroCrossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zeroCrossingRate = zeroCrossings / channelData.length;

  // Calculate frequency band energies
  const lowBandEnd = Math.floor((200 * fftSize) / sampleRate); // 0-200 Hz (sub bass)
  const midBandEnd = Math.floor((2000 * fftSize) / sampleRate); // 200-2000 Hz
  
  let lowFreqEnergy = 0;
  let midFreqEnergy = 0;
  let highFreqEnergy = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    const energy = frequencyData[i] * frequencyData[i];
    if (i < lowBandEnd) {
      lowFreqEnergy += energy;
    } else if (i < midBandEnd) {
      midFreqEnergy += energy;
    } else {
      highFreqEnergy += energy;
    }
  }

  // Normalize by bin count
  lowFreqEnergy = lowFreqEnergy / lowBandEnd;
  midFreqEnergy = midFreqEnergy / (midBandEnd - lowBandEnd);
  highFreqEnergy = highFreqEnergy / (frequencyData.length - midBandEnd);

  return {
    spectralCentroid,
    spectralRolloff,
    spectralFlatness,
    rmsEnergy,
    zeroCrossingRate,
    lowFreqEnergy,
    midFreqEnergy,
    highFreqEnergy,
    duration,
  };
};

export const loadAudioFile = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
};
