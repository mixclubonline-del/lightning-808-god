import { ReactNode } from "react";
import { GripVertical } from "lucide-react";

interface DraggableEffectModuleProps {
  id: string;
  children: ReactNode;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
}

export const DraggableEffectModule = ({
  id,
  children,
  onDragStart,
  onDragOver,
  onDrop,
}: DraggableEffectModuleProps) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(id)}
      className="relative group cursor-move"
    >
      {/* Drag Handle */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical 
          size={20} 
          className="text-primary/60 hover:text-primary"
        />
      </div>
      
      {children}
    </div>
  );
};
