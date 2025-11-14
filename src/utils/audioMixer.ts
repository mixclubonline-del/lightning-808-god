/**
 * Mix two AudioBuffers together with individual gain controls
 */
export async function mixAudioBuffers(
  buffer1: AudioBuffer,
  buffer2: AudioBuffer,
  gain1: number = 1.0,
  gain2: number = 1.0
): Promise<AudioBuffer> {
  const sampleRate = Math.max(buffer1.sampleRate, buffer2.sampleRate);
  const numberOfChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);
  const length = Math.max(buffer1.length, buffer2.length);
  
  const audioContext = new AudioContext({ sampleRate });
  const mixedBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const outputData = mixedBuffer.getChannelData(channel);
    const data1 = channel < buffer1.numberOfChannels ? buffer1.getChannelData(channel) : new Float32Array(length);
    const data2 = channel < buffer2.numberOfChannels ? buffer2.getChannelData(channel) : new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      const sample1 = i < data1.length ? data1[i] * gain1 : 0;
      const sample2 = i < data2.length ? data2[i] * gain2 : 0;
      outputData[i] = Math.max(-1, Math.min(1, sample1 + sample2));
    }
  }
  
  await audioContext.close();
  return mixedBuffer;
}

/**
 * Mix multiple AudioBuffers with individual gains
 */
export async function mixMultipleBuffers(
  buffers: AudioBuffer[],
  gains: number[]
): Promise<AudioBuffer> {
  if (buffers.length === 0) {
    throw new Error('No buffers to mix');
  }
  
  if (buffers.length === 1) {
    return buffers[0];
  }
  
  let result = buffers[0];
  for (let i = 1; i < buffers.length; i++) {
    result = await mixAudioBuffers(result, buffers[i], 1.0, gains[i] || 1.0);
  }
  
  return result;
}

/**
 * Time-stretch a buffer to match target duration (simple implementation)
 */
export async function timeStretch(buffer: AudioBuffer, targetDuration: number): Promise<AudioBuffer> {
  const ratio = targetDuration / buffer.duration;
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;
  const targetLength = Math.floor(buffer.length * ratio);
  
  const audioContext = new AudioContext({ sampleRate });
  const stretchedBuffer = audioContext.createBuffer(numberOfChannels, targetLength, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = stretchedBuffer.getChannelData(channel);
    
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = i / ratio;
      const index1 = Math.floor(sourceIndex);
      const index2 = Math.min(index1 + 1, inputData.length - 1);
      const fraction = sourceIndex - index1;
      
      // Linear interpolation
      outputData[i] = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
    }
  }
  
  await audioContext.close();
  return stretchedBuffer;
}

/**
 * Normalize audio buffer to target peak level
 */
export async function normalizeBuffer(buffer: AudioBuffer, targetPeak: number = 1.0): Promise<AudioBuffer> {
  const numberOfChannels = buffer.numberOfChannels;
  let maxPeak = 0;
  
  // Find max peak across all channels
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      maxPeak = Math.max(maxPeak, Math.abs(data[i]));
    }
  }
  
  if (maxPeak === 0) return buffer;
  
  const gain = targetPeak / maxPeak;
  const audioContext = new AudioContext({ sampleRate: buffer.sampleRate });
  const normalizedBuffer = audioContext.createBuffer(
    numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = normalizedBuffer.getChannelData(channel);
    
    for (let i = 0; i < buffer.length; i++) {
      outputData[i] = inputData[i] * gain;
    }
  }
  
  await audioContext.close();
  return normalizedBuffer;
}

/**
 * Concatenate multiple AudioBuffers in sequence
 */
export async function concatenateBuffers(buffers: AudioBuffer[]): Promise<AudioBuffer> {
  if (buffers.length === 0) {
    throw new Error('No buffers to concatenate');
  }
  
  const sampleRate = buffers[0].sampleRate;
  const numberOfChannels = buffers[0].numberOfChannels;
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  
  const audioContext = new AudioContext({ sampleRate });
  const concatenatedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const outputData = concatenatedBuffer.getChannelData(channel);
    let offset = 0;
    
    for (const buffer of buffers) {
      const inputData = buffer.getChannelData(channel);
      outputData.set(inputData, offset);
      offset += buffer.length;
    }
  }
  
  await audioContext.close();
  return concatenatedBuffer;
}
