'use client';

import { useState } from 'react';
import type { ScanParams } from '@/lib/types';
import NeonBorder from './NeonBorder';

interface ScanFormProps {
  onStartScan: (params: ScanParams) => void;
  onAbort: () => void;
  isScanning: boolean;
}

const PORT_PRESETS = [
  { label: 'Common Ports (30)', value: 'common' },
  { label: 'Well-Known (1-1024)', value: '1-1024' },
  { label: 'Full Scan (1-65535)', value: '1-65535' },
  { label: 'Custom', value: 'custom' },
];

export default function ScanForm({ onStartScan, onAbort, isScanning }: ScanFormProps) {
  const [target, setTarget] = useState('');
  const [portPreset, setPortPreset] = useState('common');
  const [customRange, setCustomRange] = useState('');
  const [concurrency, setConcurrency] = useState(200);
  const [bannerGrab, setBannerGrab] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) {
      onAbort();
      return;
    }

    const portRange = portPreset === 'custom' ? customRange : portPreset;
    onStartScan({ target, portRange, concurrency, bannerGrab });
  };

  return (
    <NeonBorder color="cyan">
      <h2 className="text-neon-cyan neon-glow-cyan text-lg mb-4 tracking-wider">
        TARGET ACQUISITION
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target IP */}
        <div>
          <label className="block text-xs text-neon-cyan/60 mb-1 tracking-widest uppercase">
            Target IP / Hostname
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="192.168.1.1 or localhost"
            disabled={isScanning}
            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-neon-lime font-mono text-sm
                       focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_5px_#00fff2]
                       placeholder:text-neon-cyan/20 disabled:opacity-50"
            required
          />
        </div>

        {/* Port Range */}
        <div>
          <label className="block text-xs text-neon-cyan/60 mb-1 tracking-widest uppercase">
            Port Range
          </label>
          <select
            value={portPreset}
            onChange={(e) => setPortPreset(e.target.value)}
            disabled={isScanning}
            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-neon-magenta font-mono text-sm
                       focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_5px_#00fff2] disabled:opacity-50"
          >
            {PORT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {portPreset === 'custom' && (
            <input
              type="text"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              placeholder="80,443,8080 or 1-1024"
              disabled={isScanning}
              className="w-full mt-2 bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-neon-magenta font-mono text-sm
                         focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_5px_#00fff2]
                         placeholder:text-neon-cyan/20 disabled:opacity-50"
              required
            />
          )}
        </div>

        {/* Concurrency + Banner Grab */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neon-cyan/60 mb-1 tracking-widest uppercase">
              Concurrency: {concurrency}
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              disabled={isScanning}
              className="w-full accent-neon-cyan disabled:opacity-50"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bannerGrab}
                onChange={(e) => setBannerGrab(e.target.checked)}
                disabled={isScanning}
                className="accent-neon-magenta w-4 h-4"
              />
              <span className="text-xs text-neon-magenta/80 tracking-widest uppercase">
                Banner Grab
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-3 rounded font-bold tracking-[0.3em] uppercase text-sm transition-all duration-300 ${
            isScanning
              ? 'bg-neon-red/20 border border-neon-red text-neon-red hover:bg-neon-red/30 shadow-[0_0_10px_rgba(255,0,64,0.3)]'
              : 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 shadow-[0_0_10px_rgba(0,255,242,0.3)] hover:shadow-[0_0_20px_rgba(0,255,242,0.5)]'
          }`}
        >
          {isScanning ? '[ ABORT SCAN ]' : '[ INITIATE SCAN ]'}
        </button>
      </form>
    </NeonBorder>
  );
}
