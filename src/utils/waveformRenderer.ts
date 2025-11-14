export interface WaveformRenderOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  waveColor?: string;
  progressColor?: string;
  pixelsPerSecond?: number;
}

/**
 * Render waveform to canvas from AudioBuffer
 */
export function renderWaveform(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  options: WaveformRenderOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const { width, height, backgroundColor = '#1a1a1a', waveColor = '#ffffff' } = options;
  
  canvas.width = width;
  canvas.height = height;
  
  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const channelData = buffer.getChannelData(0);
  const step = Math.ceil(channelData.length / width);
  const amp = height / 2;
  
  ctx.fillStyle = waveColor;
  ctx.beginPath();
  
  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;
    
    for (let j = 0; j < step; j++) {
      const datum = channelData[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    
    const x = i;
    const y1 = (1 + min) * amp;
    const y2 = (1 + max) * amp;
    
    ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
  }
}

/**
 * Render waveform with markers
 */
export function renderWaveformWithMarkers(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  markers: number[],
  selectedSlice: number | null,
  options: WaveformRenderOptions
): void {
  renderWaveform(canvas, buffer, options);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const { width, height } = options;
  const duration = buffer.duration;
  
  // Highlight selected slice
  if (selectedSlice !== null && markers.length > 0) {
    const sortedMarkers = [0, ...markers.sort((a, b) => a - b), duration];
    if (selectedSlice < sortedMarkers.length - 1) {
      const startTime = sortedMarkers[selectedSlice];
      const endTime = sortedMarkers[selectedSlice + 1];
      const startX = (startTime / duration) * width;
      const endX = (endTime / duration) * width;
      
      ctx.fillStyle = 'rgba(251, 146, 60, 0.2)'; // accent color with opacity
      ctx.fillRect(startX, 0, endX - startX, height);
    }
  }
  
  // Draw markers
  ctx.strokeStyle = '#06b6d4'; // cyan
  ctx.lineWidth = 2;
  
  for (const marker of markers) {
    const x = (marker / duration) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

/**
 * Get time from canvas X position
 */
export function getTimeFromX(x: number, canvasWidth: number, duration: number): number {
  return (x / canvasWidth) * duration;
}

/**
 * Get X position from time
 */
export function getXFromTime(time: number, canvasWidth: number, duration: number): number {
  return (time / duration) * canvasWidth;
}

/**
 * Find nearest marker to X position
 */
export function findNearestMarker(
  x: number,
  markers: number[],
  canvasWidth: number,
  duration: number,
  threshold: number = 10
): number | null {
  const time = getTimeFromX(x, canvasWidth, duration);
  
  let nearestIndex = -1;
  let nearestDistance = Infinity;
  
  for (let i = 0; i < markers.length; i++) {
    const markerX = getXFromTime(markers[i], canvasWidth, duration);
    const distance = Math.abs(markerX - x);
    
    if (distance < threshold && distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }
  
  return nearestIndex >= 0 ? nearestIndex : null;
}
