'use client';

import { useScanStream } from '@/hooks/useScanStream';
import ScanForm from '@/components/ScanForm';
import ScanProgress from '@/components/ScanProgress';
import ResultsTable from '@/components/ResultsTable';
import TerminalOutput from '@/components/TerminalOutput';

export default function Home() {
  const {
    status,
    progress,
    portsScanned,
    totalPorts,
    openPorts,
    logs,
    startScan,
    abortScan,
  } = useScanStream();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neon-cyan neon-glow-cyan tracking-[0.5em] mb-2">
          TRINITY
        </h1>
        <p className="text-xs text-neon-magenta/50 tracking-[0.3em] uppercase">
          Network Reconnaissance System
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScanForm
          onStartScan={startScan}
          onAbort={abortScan}
          isScanning={status === 'scanning'}
        />
        <ScanProgress
          progress={progress}
          portsScanned={portsScanned}
          totalPorts={totalPorts}
          openPortCount={openPorts.length}
          status={status}
        />
      </div>

      <TerminalOutput logs={logs} />
      <ResultsTable results={openPorts} />
    </div>
  );
}
