'use client';

import type { PortResult } from '@/lib/types';
import NeonBorder from './NeonBorder';

interface ResultsTableProps {
  results: PortResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) return null;

  const sorted = [...results].sort((a, b) => a.port - b.port);

  return (
    <NeonBorder color="lime">
      <h2 className="text-neon-lime neon-glow-lime text-lg mb-4 tracking-wider">
        OPEN PORTS — {results.length} FOUND
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neon-lime/30">
              <th className="text-left py-2 px-3 text-neon-lime/70 text-xs tracking-widest">PORT</th>
              <th className="text-left py-2 px-3 text-neon-lime/70 text-xs tracking-widest">STATUS</th>
              <th className="text-left py-2 px-3 text-neon-lime/70 text-xs tracking-widest">SERVICE</th>
              <th className="text-left py-2 px-3 text-neon-lime/70 text-xs tracking-widest">BANNER</th>
              <th className="text-right py-2 px-3 text-neon-lime/70 text-xs tracking-widest">LATENCY</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((result) => (
              <tr
                key={result.port}
                className="border-b border-cyber-border/50 hover:bg-neon-lime/5 transition-colors"
                style={{ animation: 'fade-in 0.3s ease-out' }}
              >
                <td className="py-2 px-3 text-neon-cyan font-bold">{result.port}</td>
                <td className="py-2 px-3">
                  <span className="text-neon-lime font-bold">OPEN</span>
                </td>
                <td className="py-2 px-3 text-neon-magenta">{result.service || '—'}</td>
                <td className="py-2 px-3 text-neon-yellow/70 text-xs max-w-xs truncate">
                  {result.banner || '—'}
                </td>
                <td className="py-2 px-3 text-right text-neon-cyan/70">{result.responseTimeMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeonBorder>
  );
}
