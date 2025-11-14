import { ReactNode, useState as useStateReact } from "react";
import { GripVertical } from "lucide-react";

interface DraggableEffectModuleProps {
  id: string;
  children: ReactNode;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  isDragging?: boolean;
  isOver?: boolean;
}

export const DraggableEffectModule = ({
  id,
  children,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  isOver = false,
}: DraggableEffectModuleProps) => {
  const [localIsOver, setLocalIsOver] = useStateReact(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStart(id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(id);
        setLocalIsOver(false);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setLocalIsOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setLocalIsOver(false);
      }}
      className={`
        relative group rounded-3xl transition-all duration-300
        ${isDragging ? 'opacity-40 scale-95 cursor-grabbing' : 'cursor-grab hover:scale-[1.02]'}
        ${isOver || localIsOver ? 'ring-2 ring-primary ring-offset-4 ring-offset-background shadow-2xl shadow-primary/30' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className={`
        absolute -left-3 top-1/2 -translate-y-1/2 z-20 
        transition-all duration-300
        ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <div className="flex flex-col items-center gap-1 bg-synth-panel border border-synth-border rounded-lg p-2 shadow-xl backdrop-blur-sm">
          <GripVertical 
            size={16} 
            className="text-primary/80 hover:text-primary"
          />
          <span className="text-[10px] text-muted-foreground font-medium">DRAG</span>
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {(isOver || localIsOver) && (
        <div className="absolute inset-0 bg-primary/10 rounded-3xl pointer-events-none animate-pulse border-2 border-primary border-dashed" />
      )}

      {/* Dragging Ghost Effect */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl pointer-events-none" />
      )}
      
      {children}
    </div>
  );
};
