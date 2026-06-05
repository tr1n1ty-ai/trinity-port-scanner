'use client';

import { useState } from 'react';
import type { ScanHistoryEntry, PortResult } from '@/lib/types';

interface HistoryListProps {
  entries: ScanHistoryEntry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function PortRow({ result }: { result: PortResult }) {
  return (
    <tr className="border-b border-cyber-border/30">
      <td className="py-1 px-2 text-neon-cyan">{result.port}</td>
      <td className="py-1 px-2 text-neon-lime">OPEN</td>
      <td className="py-1 px-2 text-neon-magenta">{result.service || '—'}</td>
      <td className="py-1 px-2 text-right text-neon-cyan/60">{result.responseTimeMs}ms</td>
    </tr>
  );
}

export default function HistoryList({ entries, onDelete, onClearAll }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-neon-cyan/30 tracking-widest text-sm">
        NO SCAN HISTORY FOUND
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onClearAll}
          className="text-xs text-neon-red/60 hover:text-neon-red border border-neon-red/30 hover:border-neon-red
                     px-3 py-1 rounded tracking-widest transition-colors"
        >
          CLEAR ALL
        </button>
      </div>

      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const date = new Date(entry.startedAt);

        return (
          <div
            key={entry.id}
            className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden
                       hover:border-neon-cyan/30 transition-colors"
          >
            <div
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
            >
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-neon-cyan font-bold">{entry.target}</div>
                  <div className="text-[10px] text-neon-cyan/40 tracking-widest">
                    {date.toLocaleDateString()} {date.toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs text-neon-magenta/60">
                  Ports: {entry.portRange}
                </div>
                <div className="text-xs">
                  <span className="text-neon-lime font-bold">{entry.openPorts.length}</span>
                  <span className="text-neon-lime/50"> open</span>
                  <span className="text-neon-cyan/30 mx-1">/</span>
                  <span className="text-neon-cyan/50">{entry.totalScanned} scanned</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="text-neon-red/40 hover:text-neon-red text-xs transition-colors"
                >
                  DEL
                </button>
                <span className="text-neon-cyan/30 text-xs">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {isExpanded && entry.openPorts.length > 0 && (
              <div className="border-t border-cyber-border p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left py-1 px-2 text-neon-lime/50 tracking-widest">PORT</th>
                      <th className="text-left py-1 px-2 text-neon-lime/50 tracking-widest">STATUS</th>
                      <th className="text-left py-1 px-2 text-neon-lime/50 tracking-widest">SERVICE</th>
                      <th className="text-right py-1 px-2 text-neon-lime/50 tracking-widest">LATENCY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.openPorts.map((port) => (
                      <PortRow key={port.port} result={port} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
