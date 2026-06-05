'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScanHistoryEntry } from '@/lib/types';
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/history');
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAll = async () => {
    await fetch('/api/history', { method: 'DELETE' });
    setEntries([]);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neon-magenta neon-glow-magenta tracking-[0.4em] mb-2">
          SCAN HISTORY
        </h1>
        <p className="text-xs text-neon-cyan/40 tracking-[0.3em] uppercase">
          Previous Reconnaissance Operations
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-neon-cyan/40 animate-pulse tracking-widest text-sm">
          LOADING DATA...
        </div>
      ) : (
        <HistoryList
          entries={entries}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
