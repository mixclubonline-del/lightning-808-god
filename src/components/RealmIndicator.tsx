import { Zap, Music, Flame, Package, Eye, TrendingUp } from "lucide-react";
import { RealmType } from "./OlympusHub";
import { mythSounds } from "@/utils/mythologicalSounds";

interface RealmIndicatorProps {
  currentRealm: RealmType;
  onClick: () => void;
}

const realmConfig = {
  zeus: { 
    icon: Zap, 
    color: "text-red-500", 
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    bg: "from-red-500/20 to-amber-500/20"
  },
  apollo: { 
    icon: Music, 
    color: "text-blue-500", 
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.6)]",
    bg: "from-blue-500/20 to-cyan-500/20"
  },
  vulcan: { 
    icon: Flame, 
    color: "text-orange-500", 
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.6)]",
    bg: "from-orange-500/20 to-red-500/20"
  },
  pandora: { 
    icon: Package, 
    color: "text-purple-500", 
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.6)]",
    bg: "from-purple-500/20 to-pink-500/20"
  },
  oracle: { 
    icon: Eye, 
    color: "text-cyan-500", 
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    bg: "from-cyan-500/20 to-teal-500/20"
  },
  hermes: { 
    icon: TrendingUp, 
    color: "text-green-500", 
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.6)]",
    bg: "from-green-500/20 to-emerald-500/20"
  }
};

export function RealmIndicator({ currentRealm, onClick }: RealmIndicatorProps) {
  const config = realmConfig[currentRealm];
  const Icon = config.icon;

  return (
    <button
      onClick={() => {
        mythSounds.playUIClick();
        onClick();
      }}
      className={`
        fixed top-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br ${config.bg}
        border-2 border-white/30
        backdrop-blur-sm
        flex items-center justify-center
        hover:scale-110 hover:border-white
        transition-all duration-300
        ${config.glow}
        group
      `}
      title="Open Olympus Hub (ESC)"
    >
      <Icon className={`w-6 h-6 ${config.color} group-hover:scale-125 transition-transform`} />
      
      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-75" />
    </button>
  );
}
