import { useEffect } from "react";
import { Zap, Music, Flame, Package, Eye, TrendingUp } from "lucide-react";

export type RealmType = "zeus" | "apollo" | "vulcan" | "pandora" | "oracle" | "hermes";

interface OlympusHubProps {
  isOpen: boolean;
  onClose: () => void;
  onRealmSelect: (realm: RealmType) => void;
  currentRealm: RealmType;
}

const realms = [
  { 
    id: "zeus" as RealmType, 
    name: "ZEUS", 
    subtitle: "Core Synthesis",
    icon: Zap, 
    color: "from-red-500/20 to-amber-500/20",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.5)]",
    position: "top-0 left-1/2 -translate-x-1/2 -translate-y-8"
  },
  { 
    id: "apollo" as RealmType, 
    name: "APOLLO", 
    subtitle: "Melody & Keys",
    icon: Music, 
    color: "from-blue-500/20 to-cyan-500/20",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.5)]",
    position: "top-1/4 right-0 translate-x-8"
  },
  { 
    id: "vulcan" as RealmType, 
    name: "VULCAN", 
    subtitle: "Effects Forge",
    icon: Flame, 
    color: "from-orange-500/20 to-red-500/20",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.5)]",
    position: "bottom-1/4 right-0 translate-x-8"
  },
  { 
    id: "pandora" as RealmType, 
    name: "PANDORA", 
    subtitle: "Library",
    icon: Package, 
    color: "from-purple-500/20 to-pink-500/20",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.5)]",
    position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-8"
  },
  { 
    id: "oracle" as RealmType, 
    name: "ORACLE", 
    subtitle: "AI Intelligence",
    icon: Eye, 
    color: "from-cyan-500/20 to-teal-500/20",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.5)]",
    position: "bottom-1/4 left-0 -translate-x-8"
  },
  { 
    id: "hermes" as RealmType, 
    name: "HERMES", 
    subtitle: "Mixing",
    icon: TrendingUp, 
    color: "from-green-500/20 to-emerald-500/20",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.5)]",
    position: "top-1/4 left-0 -translate-x-8"
  }
];

export function OlympusHub({ isOpen, onClose, onRealmSelect, currentRealm }: OlympusHubProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-[600px] h-[600px]" onClick={(e) => e.stopPropagation()}>
        {/* Mount Olympus Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-primary/10 rounded-full blur-xl animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-6xl animate-scale-in">⚡</div>
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="text-xl font-bold text-primary tracking-widest" style={{ fontFamily: 'serif' }}>
                OLYMPUS
              </div>
              <div className="text-xs text-muted-foreground text-center tracking-wider">
                Choose Your Realm
              </div>
            </div>
          </div>
        </div>

        {/* Realm Circles */}
        {realms.map((realm, index) => {
          const Icon = realm.icon;
          const isActive = currentRealm === realm.id;
          const delay = index * 100;

          return (
            <div
              key={realm.id}
              className={`absolute ${realm.position} animate-fade-in`}
              style={{ animationDelay: `${delay}ms` }}
            >
              <button
                onClick={() => {
                  onRealmSelect(realm.id);
                  onClose();
                }}
                className={`
                  group relative w-28 h-28 rounded-full
                  bg-gradient-to-br ${realm.color}
                  border-2 ${isActive ? 'border-white' : 'border-white/30'}
                  backdrop-blur-sm
                  hover:scale-110 hover:border-white
                  transition-all duration-300
                  ${isActive ? realm.glow : 'hover:' + realm.glow}
                `}
              >
                {/* Constellation Lines to Center */}
                <svg className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                  <line 
                    x1="150" 
                    y1="150" 
                    x2={realm.position.includes('right') ? '200' : realm.position.includes('left') ? '100' : '150'}
                    y2={realm.position.includes('top') ? '100' : realm.position.includes('bottom') ? '200' : '150'}
                    stroke="currentColor" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-primary/50"
                  />
                </svg>

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-white group-hover:scale-125 transition-transform" />
                </div>

                {/* Realm Name */}
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <div className="text-sm font-bold text-white tracking-widest" style={{ fontFamily: 'serif' }}>
                    {realm.name}
                  </div>
                  <div className="text-xs text-white/60 tracking-wide">
                    {realm.subtitle}
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -inset-2 rounded-full border-2 border-white/50 animate-ping" />
                )}
              </button>
            </div>
          );
        })}

        {/* ESC hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/50 tracking-wider">
          Press ESC to close
        </div>
      </div>
    </div>
  );
}
