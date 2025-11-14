import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation = ({ onComplete }: OpeningAnimationProps) => {
  const [stage, setStage] = useState<"stars" | "mountain" | "lightning" | "text" | "complete">("stars");

  useEffect(() => {
    // Stage 1: Stars appear (0-1s)
    const starsTimer = setTimeout(() => {
      setStage("mountain");
    }, 1000);

    // Stage 2: Mountain rises (1-2.5s)
    const mountainTimer = setTimeout(() => {
      setStage("lightning");
    }, 2500);

    // Stage 3: Lightning strikes (2.5-3.5s)
    const lightningTimer = setTimeout(() => {
      setStage("text");
    }, 3500);

    // Stage 4: Text appears (3.5-5.5s)
    const textTimer = setTimeout(() => {
      setStage("complete");
    }, 5500);

    // Stage 5: Fade out and complete (5.5-6.5s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6500);

    return () => {
      clearTimeout(starsTimer);
      clearTimeout(mountainTimer);
      clearTimeout(lightningTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        stage === "complete" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: stage !== "stars" ? `twinkle ${2 + Math.random() * 3}s ease-in-out infinite` : "star-appear 1s ease-out forwards",
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Mount Olympus */}
      {stage !== "stars" && (
        <div className="relative flex flex-col items-center">
          {/* Mountain Base */}
          <div 
            className="relative"
            style={{
              animation: "mountain-rise 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            {/* Mountain Peak */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl"
                style={{
                  animation: stage === "lightning" || stage === "text" || stage === "complete" 
                    ? "pulse 0.5s ease-in-out infinite" 
                    : "none",
                }}
              />
              
              {/* Mountain Shape */}
              <div className="relative w-0 h-0 border-l-[120px] border-l-transparent border-r-[120px] border-r-transparent border-b-[200px] border-b-primary/30">
                {/* Peak Highlight */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] border-b-primary/50" />
              </div>

              {/* Lightning Bolt Icon */}
              {stage === "lightning" || stage === "text" || stage === "complete" ? (
                <div className="absolute top-0">
                  <Zap 
                    className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(239,68,68,0.9)]"
                    style={{
                      animation: "lightning-strike 0.3s ease-out",
                      fill: "currentColor",
                    }}
                  />
                  
                  {/* Lightning Flash */}
                  <div 
                    className="absolute inset-0 bg-primary/40 rounded-full blur-2xl"
                    style={{
                      animation: "lightning-flash 0.3s ease-out",
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Welcome Text */}
          {stage === "text" || stage === "complete" ? (
            <div 
              className="mt-12 text-center opacity-0"
              style={{
                animation: "text-reveal 2s ease-out forwards",
              }}
            >
              <h1 
                className="text-7xl font-bold tracking-[0.3em] text-primary mb-4"
                style={{
                  fontFamily: 'serif',
                  textShadow: '0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4)',
                }}
              >
                VST GOD
              </h1>
              <p 
                className="text-2xl text-foreground/80 tracking-[0.2em]"
                style={{
                  fontFamily: 'serif',
                  textShadow: '0 0 20px rgba(255,255,255,0.5)',
                }}
              >
                Divine Sound Design
              </p>
              
              {/* Decorative Lines */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="w-24 h-[2px] bg-gradient-to-r from-transparent to-primary" />
                <Zap className="w-6 h-6 text-primary" fill="currentColor" />
                <div className="w-24 h-[2px] bg-gradient-to-l from-transparent to-primary" />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Lightning Bolts Background */}
      {stage === "lightning" && (
        <>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-primary shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              style={{
                left: `${20 + i * 15}%`,
                top: '0',
                height: '100%',
                animation: `lightning-bolt 0.2s ease-out`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
