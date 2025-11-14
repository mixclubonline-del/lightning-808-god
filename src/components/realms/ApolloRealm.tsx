import { OrpheusKeys } from "@/components/OrpheusKeys";
import { ApolloEnvelope } from "@/components/ApolloEnvelope";
import { HarmoniaChords } from "@/components/HarmoniaChords";
import { OlympusPads } from "@/components/OlympusPads";
import { Music } from "lucide-react";

interface ApolloRealmProps {
  attack: number;
  setAttack: (v: number) => void;
  decay: number;
  setDecay: (v: number) => void;
  sustain: number;
  setSustain: (v: number) => void;
  release: number;
  setRelease: (v: number) => void;
  onNoteOn: (note: number) => void;
  onNoteOff: (note: number) => void;
  onChordPlay: (chord: number[]) => void;
  onPadTrigger: (padIndex: number) => void;
}

export function ApolloRealm(props: ApolloRealmProps) {
  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-blue-950/20 to-transparent">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-blue-500">
          <Music className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(59,130,246,0.6)' }}>
            APOLLO REALM
          </h1>
          <Music className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Melody & Harmony</p>
      </div>

      {/* Apollo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Music className="w-[600px] h-[600px]" />
      </div>

      <div className="relative mt-24 space-y-6">
        {/* Full Keyboard */}
        <OrpheusKeys onNoteOn={props.onNoteOn} onNoteOff={props.onNoteOff} />

        {/* Envelope */}
        <ApolloEnvelope
          attack={props.attack}
          decay={props.decay}
          sustain={props.sustain}
          release={props.release}
          onAttackChange={props.setAttack}
          onDecayChange={props.setDecay}
          onSustainChange={props.setSustain}
          onReleaseChange={props.setRelease}
        />

        {/* Chord Generator */}
        <HarmoniaChords onChordPlay={props.onChordPlay} />

        {/* Pads */}
        <OlympusPads onPadTrigger={props.onPadTrigger} />
      </div>
    </div>
  );
}
