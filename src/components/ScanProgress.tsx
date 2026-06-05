'use client';

import NeonBorder from './NeonBorder';

interface ScanProgressProps {
  progress: number;
  portsScanned: number;
  totalPorts: number;
  openPortCount: number;
  status: string;
}

export default function ScanProgress({
  progress,
  portsScanned,
  totalPorts,
  openPortCount,
  status,
}: ScanProgressProps) {
  if (status === 'idle') return null;

  return (
    <NeonBorder color="magenta">
      <h2 className="text-neon-magenta neon-glow-magenta text-lg mb-4 tracking-wider">
        SCAN PROGRESS
      </h2>

      {/* Progress bar */}
      <div className="relative h-4 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border mb-3">
        <div
          className="h-full neon-progress-bar rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
          {progress}%
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-neon-cyan">{portsScanned}</div>
          <div className="text-[10px] text-neon-cyan/50 tracking-widest uppercase">Scanned</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neon-yellow">{totalPorts}</div>
          <div className="text-[10px] text-neon-yellow/50 tracking-widest uppercase">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neon-lime neon-glow-lime">{openPortCount}</div>
          <div className="text-[10px] text-neon-lime/50 tracking-widest uppercase">Open</div>
        </div>
      </div>

      {status === 'scanning' && (
        <div className="mt-3 text-center text-xs text-neon-magenta/60 animate-pulse tracking-widest">
          SCANNING...
        </div>
      )}
      {status === 'complete' && (
        <div className="mt-3 text-center text-xs text-neon-lime tracking-widest">
          SCAN COMPLETE
        </div>
      )}
    </NeonBorder>
  );
}
