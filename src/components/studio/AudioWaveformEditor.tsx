import { useEffect, useRef, useState } from "react";
import { renderWaveformWithMarkers, getTimeFromX, findNearestMarker } from "@/utils/waveformRenderer";

interface AudioWaveformEditorProps {
  audioBuffer: AudioBuffer;
  sliceMarkers: number[];
  onMarkersChange: (markers: number[]) => void;
  selectedSlice: number | null;
  onSliceSelect: (index: number) => void;
}

export const AudioWaveformEditor = ({
  audioBuffer,
  sliceMarkers,
  onMarkersChange,
  selectedSlice,
  onSliceSelect,
}: AudioWaveformEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingMarker, setDraggingMarker] = useState<number | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    renderWaveformWithMarkers(
      canvasRef.current,
      audioBuffer,
      sliceMarkers,
      selectedSlice,
      {
        width: canvasWidth,
        height: 200,
        backgroundColor: '#0a0a0a',
        waveColor: '#ffffff',
      }
    );
  }, [audioBuffer, sliceMarkers, selectedSlice, canvasWidth]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = getTimeFromX(x, canvasWidth, audioBuffer.duration);

    // Check if clicking near existing marker
    const nearestMarker = findNearestMarker(x, sliceMarkers, canvasWidth, audioBuffer.duration, 10);
    
    if (nearestMarker !== null) {
      // Remove marker
      const newMarkers = sliceMarkers.filter((_, i) => i !== nearestMarker);
      onMarkersChange(newMarkers);
    } else {
      // Add marker
      onMarkersChange([...sliceMarkers, time].sort((a, b) => a - b));
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const nearestMarker = findNearestMarker(x, sliceMarkers, canvasWidth, audioBuffer.duration, 10);

    if (nearestMarker !== null) {
      setDraggingMarker(nearestMarker);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingMarker === null || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(audioBuffer.duration, getTimeFromX(x, canvasWidth, audioBuffer.duration)));

    const newMarkers = [...sliceMarkers];
    newMarkers[draggingMarker] = time;
    onMarkersChange(newMarkers.sort((a, b) => a - b));
  };

  const handleMouseUp = () => {
    setDraggingMarker(null);
  };

  const handleSliceClick = (sliceIndex: number) => {
    onSliceSelect(sliceIndex);
  };

  // Calculate slice regions for clicking
  const getSliceAtX = (x: number): number | null => {
    const time = getTimeFromX(x, canvasWidth, audioBuffer.duration);
    const sortedMarkers = [0, ...sliceMarkers.sort((a, b) => a - b), audioBuffer.duration];
    
    for (let i = 0; i < sortedMarkers.length - 1; i++) {
      if (time >= sortedMarkers[i] && time < sortedMarkers[i + 1]) {
        return i;
      }
    }
    return null;
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sliceIndex = getSliceAtX(x);

    if (sliceIndex !== null) {
      handleSliceClick(sliceIndex);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
      />
      <div className="mt-2 text-sm text-muted-foreground">
        <p>Click to add/remove markers • Drag markers to adjust • Double-click a slice to select</p>
        <p>Duration: {audioBuffer.duration.toFixed(2)}s • Slices: {sliceMarkers.length + 1}</p>
      </div>
    </div>
  );
};
