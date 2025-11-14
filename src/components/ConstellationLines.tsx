import { useEffect, useState } from "react";

interface ModuleConnection {
  from: string;
  to: string;
}

interface ConstellationLinesProps {
  connections: ModuleConnection[];
  color?: string;
  active?: boolean;
}

export const ConstellationLines = ({ 
  connections, 
  color = "hsl(var(--primary))",
  active = true 
}: ConstellationLinesProps) => {
  const [particlePositions, setParticlePositions] = useState<number[]>([]);

  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      setParticlePositions(prev => 
        prev.map(pos => (pos + 2) % 100)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    setParticlePositions(connections.map((_, i) => (i * 20) % 100));
  }, [connections]);

  const getModulePosition = (id: string) => {
    const element = document.querySelector(`[data-module="${id}"]`);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.constellation-container');
    const containerRect = container?.getBoundingClientRect();
    
    if (!containerRect) return null;
    
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none constellation-container"
      style={{ zIndex: 0 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          <stop offset="50%" style={{ stopColor: color, stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
        </linearGradient>
      </defs>
      
      {connections.map((connection, index) => {
        const from = getModulePosition(connection.from);
        const to = getModulePosition(connection.to);
        
        if (!from || !to) return null;
        
        const particlePos = particlePositions[index] || 0;
        const particleX = from.x + (to.x - from.x) * (particlePos / 100);
        const particleY = from.y + (to.y - from.y) * (particlePos / 100);
        
        return (
          <g key={`${connection.from}-${connection.to}`}>
            {/* Connection line */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              opacity={active ? 0.6 : 0.2}
              className="transition-opacity duration-500"
            />
            
            {/* Animated particle */}
            {active && (
              <circle
                cx={particleX}
                cy={particleY}
                r="4"
                fill={color}
                filter="url(#glow)"
                opacity="0.9"
                className="animate-pulse"
              />
            )}
            
            {/* Small glow at connection points */}
            <circle
              cx={from.x}
              cy={from.y}
              r="3"
              fill={color}
              opacity={active ? 0.6 : 0.3}
              filter="url(#glow)"
            />
            <circle
              cx={to.x}
              cy={to.y}
              r="3"
              fill={color}
              opacity={active ? 0.6 : 0.3}
              filter="url(#glow)"
            />
          </g>
        );
      })}
    </svg>
  );
};
