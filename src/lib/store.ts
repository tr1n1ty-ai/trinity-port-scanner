import * as fs from 'fs';
import * as path from 'path';
import type { ScanHistoryEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_PATH = path.join(DATA_DIR, 'scan-history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readHistory(): ScanHistoryEntry[] {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(HISTORY_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function appendHistory(entry: ScanHistoryEntry): void {
  ensureDataDir();
  const history = readHistory();
  history.unshift(entry);
  // Keep last 100 scans
  if (history.length > 100) history.length = 100;
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

export function deleteHistoryEntry(id: string): boolean {
  const history = readHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  history.splice(idx, 1);
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  return true;
}

export function clearHistory(): void {
  ensureDataDir();
  fs.writeFileSync(HISTORY_PATH, '[]');
}
