export interface SliceMarker {
  time: number;
  index: number;
}

export interface AudioSlice {
  buffer: AudioBuffer;
  startTime: number;
  endTime: number;
  index: number;
}

/**
 * Extract a slice from an AudioBuffer between start and end times
 */
export async function extractSlice(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number
): Promise<AudioBuffer> {
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;
  
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const length = endSample - startSample;
  
  const audioContext = new AudioContext({ sampleRate });
  const sliceBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = buffer.getChannelData(channel);
    const sliceData = sliceBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      sliceData[i] = sourceData[startSample + i] || 0;
    }
  }
  
  await audioContext.close();
  return sliceBuffer;
}

/**
 * Convert AudioBuffer to WAV Blob
 */
export async function audioBufferToBlob(buffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  
  const bytesPerSample = 2;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write audio data
  const channels = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Detect transients (sudden amplitude increases) in audio
 */
export function detectTransients(buffer: AudioBuffer, sensitivity: number = 0.3): number[] {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.02); // 20ms window
  
  const transients: number[] = [];
  let lastTransient = -1;
  const minDistance = sampleRate * 0.1; // Minimum 100ms between transients
  
  for (let i = windowSize; i < channelData.length - windowSize; i++) {
    const current = Math.abs(channelData[i]);
    const previous = Math.abs(channelData[i - windowSize]);
    
    const difference = current - previous;
    
    if (difference > sensitivity && (i - lastTransient) > minDistance) {
      transients.push(i / sampleRate);
      lastTransient = i;
    }
  }
  
  return transients;
}

/**
 * Detect BPM using autocorrelation
 */
export function detectBPM(buffer: AudioBuffer): number {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Energy envelope
  const windowSize = Math.floor(sampleRate * 0.05);
  const envelope: number[] = [];
  
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sum = 0;
    for (let j = 0; j < windowSize && i + j < channelData.length; j++) {
      sum += Math.abs(channelData[i + j]);
    }
    envelope.push(sum / windowSize);
  }
  
  // Autocorrelation
  const minBPM = 60;
  const maxBPM = 180;
  const minLag = Math.floor((60 / maxBPM) * (sampleRate / windowSize));
  const maxLag = Math.floor((60 / minBPM) * (sampleRate / windowSize));
  
  let bestCorrelation = 0;
  let bestLag = minLag;
  
  for (let lag = minLag; lag < maxLag && lag < envelope.length / 2; lag++) {
    let correlation = 0;
    for (let i = 0; i < envelope.length - lag; i++) {
      correlation += envelope[i] * envelope[i + lag];
    }
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  
  const bpm = (60 * sampleRate / windowSize) / bestLag;
  return Math.round(bpm);
}

/**
 * Generate equal-duration slice markers
 */
export function generateEqualMarkers(duration: number, interval: number): number[] {
  const markers: number[] = [];
  for (let time = interval; time < duration; time += interval) {
    markers.push(time);
  }
  return markers;
}

/**
 * Generate beat grid markers based on BPM
 */
export function generateBeatMarkers(duration: number, bpm: number): number[] {
  const beatDuration = 60 / bpm;
  return generateEqualMarkers(duration, beatDuration);
}

/**
 * Extract all slices from buffer based on markers
 */
export async function extractAllSlices(
  buffer: AudioBuffer,
  markers: number[]
): Promise<AudioSlice[]> {
  const sortedMarkers = [0, ...markers.sort((a, b) => a - b), buffer.duration];
  const slices: AudioSlice[] = [];
  
  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    const startTime = sortedMarkers[i];
    const endTime = sortedMarkers[i + 1];
    
    const sliceBuffer = await extractSlice(buffer, startTime, endTime);
    slices.push({
      buffer: sliceBuffer,
      startTime,
      endTime,
      index: i,
    });
  }
  
  return slices;
}
