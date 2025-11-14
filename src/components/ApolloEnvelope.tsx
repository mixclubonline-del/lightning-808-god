import { Knob } from "./Knob";

interface ApolloEnvelopeProps {
  attack: number;
  onAttackChange: (value: number) => void;
  decay: number;
  onDecayChange: (value: number) => void;
  sustain: number;
  onSustainChange: (value: number) => void;
  release: number;
  onReleaseChange: (value: number) => void;
}

export const ApolloEnvelope = ({
  attack,
  onAttackChange,
  decay,
  onDecayChange,
  sustain,
  onSustainChange,
  release,
  onReleaseChange,
}: ApolloEnvelopeProps) => {
  return (
    <div className="bg-synth-panel rounded-lg border-2 border-yellow-600/50 p-4 shadow-[0_0_15px_rgba(202,138,4,0.3)] marble-texture sacred-geometry deity-aura apollo-rays">
      <div className="text-yellow-400 text-sm font-medium uppercase tracking-wider mb-4 text-center divine-glow">
        Apollo Envelope
      </div>
      <div className="flex justify-around">
        <Knob label="Attack" value={attack} onChange={onAttackChange} />
        <Knob label="Decay" value={decay} onChange={onDecayChange} />
        <Knob label="Sustain" value={sustain} onChange={onSustainChange} />
        <Knob label="Release" value={release} onChange={onReleaseChange} />
      </div>
      
      {/* Visual envelope curve */}
      <div className="mt-4 h-20 bg-background/30 rounded border border-yellow-600/30 p-2">
        <svg viewBox="0 0 200 60" className="w-full h-full">
          {/* Grid */}
          <line x1="0" y1="60" x2="200" y2="60" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
          <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2,2" />
          
          {/* ADSR curve */}
          <path
            d={`
              M 0 60
              L ${attack * 0.3} ${60 - 55}
              L ${attack * 0.3 + decay * 0.4} ${60 - (sustain * 0.55)}
              L ${attack * 0.3 + decay * 0.4 + 60} ${60 - (sustain * 0.55)}
              L ${attack * 0.3 + decay * 0.4 + 60 + release * 0.3} 60
            `}
            fill="none"
            stroke="rgb(202, 138, 4)"
            strokeWidth="2"
            className="drop-shadow-[0_0_8px_rgba(202,138,4,0.6)]"
          />
          
          {/* Stage labels */}
          <text x="15" y="10" fill="currentColor" fontSize="8" className="opacity-60">A</text>
          <text x={attack * 0.3 + 20} y="10" fill="currentColor" fontSize="8" className="opacity-60">D</text>
          <text x={attack * 0.3 + decay * 0.4 + 30} y="10" fill="currentColor" fontSize="8" className="opacity-60">S</text>
          <text x={attack * 0.3 + decay * 0.4 + 80} y="10" fill="currentColor" fontSize="8" className="opacity-60">R</text>
        </svg>
      </div>
    </div>
  );
};
