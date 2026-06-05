'use client';

import { useRef, useEffect } from 'react';

interface TerminalOutputProps {
  logs: string[];
}

export default function TerminalOutput({ logs }: TerminalOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="rounded-lg bg-cyber-bg border border-cyber-border overflow-hidden">
      <div className="px-3 py-1.5 bg-cyber-surface border-b border-cyber-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-neon-red" />
        <div className="w-2 h-2 rounded-full bg-neon-yellow" />
        <div className="w-2 h-2 rounded-full bg-neon-lime" />
        <span className="text-[10px] text-neon-cyan/40 ml-2 tracking-widest">TRINITY://SCAN_LOG</span>
      </div>
      <div className="p-3 max-h-64 overflow-y-auto font-mono text-xs leading-5">
        {logs.map((log, i) => (
          <div key={i} className={log.includes('OPEN') ? 'text-neon-lime' : log.includes('ERROR') ? 'text-neon-red' : 'text-neon-cyan/60'}>
            {log}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
