import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Waves } from "lucide-react";

interface ADSRVisualEditorProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
}

type DragPoint = "attack" | "decay" | "sustain" | "release" | null;

export const ADSRVisualEditor = ({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
}: ADSRVisualEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragPoint, setDragPoint] = useState<DragPoint>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DragPoint>(null);

  const drawEnvelope = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate positions
    const attackX = padding + (attack / 100) * (graphWidth * 0.3);
    const decayX = attackX + (decay / 100) * (graphWidth * 0.3);
    const sustainY = padding + (1 - sustain / 100) * graphHeight;
    const releaseX = decayX + (graphWidth * 0.3);
    const releaseEndX = releaseX + (release / 100) * (graphWidth * 0.3);

    // Draw grid
    ctx.strokeStyle = "hsl(var(--synth-border))";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw envelope curve
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding); // Start
    ctx.lineTo(attackX, padding); // Attack
    ctx.lineTo(decayX, sustainY); // Decay
    ctx.lineTo(releaseX, sustainY); // Sustain
    ctx.lineTo(releaseEndX, height - padding); // Release
    ctx.stroke();

    // Draw control points
    const points = [
      { x: attackX, y: padding, type: "attack" as DragPoint },
      { x: decayX, y: sustainY, type: "decay" as DragPoint },
      { x: releaseX, y: sustainY, type: "sustain" as DragPoint },
      { x: releaseEndX, y: height - padding, type: "release" as DragPoint },
    ];

    points.forEach((point) => {
      const isHovered = hoveredPoint === point.type;
      const isDragged = dragPoint === point.type;
      
      ctx.fillStyle = isDragged ? "hsl(var(--accent))" : isHovered ? "hsl(var(--primary))" : "hsl(var(--primary))";
      ctx.beginPath();
      ctx.arc(point.x, point.y, isDragged ? 8 : isHovered ? 6 : 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer ring for active points
      if (isHovered || isDragged) {
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw labels
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.font = "10px monospace";
    ctx.fillText("A", attackX - 5, height - 5);
    ctx.fillText("D", decayX - 5, height - 5);
    ctx.fillText("S", releaseX - 5, height - 5);
    ctx.fillText("R", releaseEndX - 5, height - 5);
  };

  const getPointAtPosition = (x: number, y: number): DragPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const padding = 20;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    const attackX = padding + (attack / 100) * (graphWidth * 0.3);
    const decayX = attackX + (decay / 100) * (graphWidth * 0.3);
    const sustainY = padding + (1 - sustain / 100) * graphHeight;
    const releaseX = decayX + (graphWidth * 0.3);
    const releaseEndX = releaseX + (release / 100) * (graphWidth * 0.3);

    const threshold = 12;

    if (Math.abs(x - attackX) < threshold && Math.abs(y - padding) < threshold) return "attack";
    if (Math.abs(x - decayX) < threshold && Math.abs(y - sustainY) < threshold) return "decay";
    if (Math.abs(x - releaseX) < threshold && Math.abs(y - sustainY) < threshold) return "sustain";
    if (Math.abs(x - releaseEndX) < threshold && Math.abs(y - (canvas.height - padding)) < threshold) return "release";

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = getPointAtPosition(x, y);
    if (point) {
      setDragPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragPoint) {
      const padding = 20;
      const graphWidth = canvas.width - padding * 2;
      const graphHeight = canvas.height - padding * 2;

      if (dragPoint === "attack") {
        const newAttack = Math.max(0, Math.min(100, ((x - padding) / (graphWidth * 0.3)) * 100));
        onAttackChange(Math.round(newAttack));
      } else if (dragPoint === "decay") {
        const attackX = padding + (attack / 100) * (graphWidth * 0.3);
        const newDecay = Math.max(0, Math.min(100, ((x - attackX) / (graphWidth * 0.3)) * 100));
        onDecayChange(Math.round(newDecay));
        const newSustain = Math.max(0, Math.min(100, (1 - (y - padding) / graphHeight) * 100));
        onSustainChange(Math.round(newSustain));
      } else if (dragPoint === "sustain") {
        const newSustain = Math.max(0, Math.min(100, (1 - (y - padding) / graphHeight) * 100));
        onSustainChange(Math.round(newSustain));
      } else if (dragPoint === "release") {
        const attackX = padding + (attack / 100) * (graphWidth * 0.3);
        const decayX = attackX + (decay / 100) * (graphWidth * 0.3);
        const releaseX = decayX + (graphWidth * 0.3);
        const newRelease = Math.max(0, Math.min(100, ((x - releaseX) / (graphWidth * 0.3)) * 100));
        onReleaseChange(Math.round(newRelease));
      }
    } else {
      // Update hover state
      const point = getPointAtPosition(x, y);
      setHoveredPoint(point);
    }
  };

  const handleMouseUp = () => {
    setDragPoint(null);
  };

  const handleMouseLeave = () => {
    setDragPoint(null);
    setHoveredPoint(null);
  };

  useEffect(() => {
    drawEnvelope();
  }, [attack, decay, sustain, release, dragPoint, hoveredPoint]);

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Envelope Editor
          </h3>
        </div>

        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-auto bg-synth-deep rounded border border-synth-border cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground">Attack</div>
            <div className="text-accent font-mono">{attack}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Decay</div>
            <div className="text-accent font-mono">{decay}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Sustain</div>
            <div className="text-accent font-mono">{sustain}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Release</div>
            <div className="text-accent font-mono">{release}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
