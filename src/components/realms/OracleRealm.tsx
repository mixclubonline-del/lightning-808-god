import { OracleMatcher } from "@/components/OracleMatcher";
import { IrisSpectrum } from "@/components/IrisSpectrum";
import { AthenaEye } from "@/components/AthenaEye";
import { Eye } from "lucide-react";

export function OracleRealm() {
  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-cyan-950/20 to-transparent">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-cyan-500">
          <Eye className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(6,182,212,0.6)' }}>
            ORACLE REALM
          </h1>
          <Eye className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">AI Intelligence</p>
      </div>

      {/* Oracle Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Eye className="w-[600px] h-[600px]" />
      </div>

      <div className="relative mt-24 space-y-6">
        <OracleMatcher currentFeatures={null} />
        <IrisSpectrum analyserNode={null} isActive={false} />
        <AthenaEye activeLayer={null} />
      </div>
    </div>
  );
}
