export type PortStatus = 'open' | 'closed' | 'filtered';

export interface PortResult {
  port: number;
  status: PortStatus;
  service?: string;
  banner?: string;
  responseTimeMs: number;
}

export interface ScanEvent {
  type: 'progress' | 'result' | 'complete' | 'error';
  scanId: string;
  portsScanned?: number;
  totalPorts?: number;
  percentComplete?: number;
  portResult?: PortResult;
  summary?: ScanSummary;
  error?: string;
}

export interface ScanSummary {
  scanId: string;
  target: string;
  portRange: string;
  startedAt: string;
  completedAt: string;
  openPorts: PortResult[];
  totalScanned: number;
}

export interface ScanHistoryEntry extends ScanSummary {
  id: string;
}

export interface ScanParams {
  target: string;
  portRange: string;
  concurrency: number;
  bannerGrab: boolean;
}
