export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'webm';

export interface ConversionOptions {
  format: AudioFormat;
  bitrate?: number; // For lossy formats (mp3, ogg)
  quality?: number; // 0-1 for ogg/webm
  sampleRate?: number;
}

/**
 * Convert an audio buffer to a specific format
 */
export const convertAudioFormat = async (
  audioBuffer: AudioBuffer,
  options: ConversionOptions
): Promise<Blob> => {
  const { format, bitrate = 192, quality = 0.9, sampleRate } = options;

  // Create offline context for resampling if needed
  const targetSampleRate = sampleRate || audioBuffer.sampleRate;
  let processedBuffer = audioBuffer;

  if (sampleRate && sampleRate !== audioBuffer.sampleRate) {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.duration * sampleRate),
      sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    processedBuffer = await offlineContext.startRendering();
  }

  switch (format) {
    case 'wav':
      return audioBufferToWav(processedBuffer);
    case 'mp3':
      // Note: MP3 encoding not natively supported in Web Audio API
      // Would need a library like lamejs for true MP3 encoding
      // Falling back to WAV for now
      console.warn('MP3 encoding not available, using WAV instead');
      return audioBufferToWav(processedBuffer);
    case 'ogg':
    case 'webm':
      return audioBufferToWebM(processedBuffer, format, quality);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

/**
 * Convert AudioBuffer to WAV blob
 */
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const data = interleave(buffer);
  const dataLength = data.length * bytesPerSample;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio data
  floatTo16BitPCM(view, 44, data);

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

/**
 * Convert AudioBuffer to WebM/OGG using MediaRecorder
 */
const audioBufferToWebM = async (
  buffer: AudioBuffer,
  format: 'ogg' | 'webm',
  quality: number
): Promise<Blob> => {
  // Create a new audio context
  const audioContext = new AudioContext({ sampleRate: buffer.sampleRate });
  
  // Create a MediaStreamDestination
  const destination = audioContext.createMediaStreamDestination();
  
  // Create a buffer source
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);

  // Setup MediaRecorder
  const mimeType = format === 'ogg' ? 'audio/ogg' : 'audio/webm';
  const mediaRecorder = new MediaRecorder(destination.stream, {
    mimeType,
    audioBitsPerSecond: quality * 320000, // Max 320kbps
  });

  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      audioContext.close();
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      audioContext.close();
      reject(e);
    };

    // Start recording
    mediaRecorder.start();
    source.start(0);

    // Stop recording when audio finishes
    source.onended = () => {
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 100);
    };
  });
};

/**
 * Interleave multi-channel audio data
 */
const interleave = (buffer: AudioBuffer): Float32Array => {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels;
  const result = new Float32Array(length);

  let offset = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i];
    }
  }

  return result;
};

/**
 * Convert float samples to 16-bit PCM
 */
const floatTo16BitPCM = (
  view: DataView,
  offset: number,
  input: Float32Array
): void => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
};

/**
 * Write string to DataView
 */
const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Download a blob as a file
 */
export const downloadAudioFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get audio info from a file
 */
export const getAudioFileInfo = async (file: File): Promise<{
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  size: number;
  format: string;
}> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    numberOfChannels: buffer.numberOfChannels,
    size: file.size,
    format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
  };
};
