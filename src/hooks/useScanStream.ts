'use client';

import { useState, useCallback, useRef } from 'react';
import type { PortResult, ScanEvent, ScanParams, ScanSummary } from '@/lib/types';

type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

export function useScanStream() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [portsScanned, setPortsScanned] = useState(0);
  const [totalPorts, setTotalPorts] = useState(0);
  const [openPorts, setOpenPorts] = useState<PortResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  const startScan = useCallback(async (params: ScanParams) => {
    // Reset state
    setStatus('scanning');
    setProgress(0);
    setPortsScanned(0);
    setTotalPorts(0);
    setOpenPorts([]);
    setLogs([]);
    setSummary(null);

    const controller = new AbortController();
    abortRef.current = controller;

    addLog(`Initiating scan on ${params.target} [${params.portRange}]`);
    addLog(`Concurrency: ${params.concurrency} | Banner grab: ${params.bannerGrab ? 'ON' : 'OFF'}`);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const event: ScanEvent = JSON.parse(trimmed.slice(6));

          switch (event.type) {
            case 'progress':
              setProgress(event.percentComplete || 0);
              setPortsScanned(event.portsScanned || 0);
              setTotalPorts(event.totalPorts || 0);
              break;

            case 'result':
              if (event.portResult) {
                const pr = event.portResult;
                setOpenPorts((prev) => [...prev, pr]);
                addLog(
                  `Port ${pr.port} OPEN — ${pr.service || 'unknown'}${pr.banner ? ` [${pr.banner.slice(0, 60)}]` : ''} (${pr.responseTimeMs}ms)`
                );
              }
              setProgress(event.percentComplete || 0);
              setPortsScanned(event.portsScanned || 0);
              setTotalPorts(event.totalPorts || 0);
              break;

            case 'complete':
              setStatus('complete');
              setProgress(100);
              if (event.summary) {
                setSummary(event.summary);
                addLog(`Scan complete. ${event.summary.openPorts.length} open ports found out of ${event.summary.totalScanned} scanned.`);
              }
              break;

            case 'error':
              setStatus('error');
              addLog(`ERROR: ${event.error}`);
              break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        setStatus('idle');
        addLog('Scan aborted by user.');
      } else {
        setStatus('error');
        addLog(`ERROR: ${(e as Error).message}`);
      }
    }
  }, [addLog]);

  const abortScan = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return {
    status,
    progress,
    portsScanned,
    totalPorts,
    openPorts,
    logs,
    summary,
    startScan,
    abortScan,
  };
}
