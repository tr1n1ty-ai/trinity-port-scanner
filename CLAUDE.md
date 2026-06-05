# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run start` — serve production build
- No test runner or linter is configured.

## Architecture

Trinity is a browser-based TCP port scanner with a cyberpunk UI. Next.js 15 App Router, React 18, Tailwind CSS 4, TypeScript.

### Scanning pipeline

1. **Client** (`src/hooks/useScanStream.ts`) — `useScanStream` hook POSTs scan params to `/api/scan` and reads the response as an SSE stream, updating React state per event.
2. **API route** (`src/app/api/scan/route.ts`) — streams `ScanEvent` objects (progress / result / complete / error) via `ReadableStream` using the SSE `data:` protocol.
3. **Scanner** (`src/lib/scanner.ts`) — async generator that probes ports using raw TCP sockets (`net.Socket`). Runs a concurrent worker pool (default 200). Supports abort via `AbortSignal`.
4. **Services** (`src/lib/services.ts`) — maps port numbers to service names; optional banner grabbing via short TCP read.

### Data persistence

Scan history is stored as JSON on disk at `data/scan-history.json` (max 100 entries). Read/write logic in `src/lib/store.ts`. History API at `/api/history`.

### Pages

- `/` — scan form + live progress + terminal log + results table (client component)
- `/history` — past scan results

### Styling

Cyberpunk/neon theme using Tailwind with custom colors (`neon-cyan`, `neon-magenta`, `neon-green`, `cyber-bg`, `cyber-surface`, `cyber-border`). JetBrains Mono font. Custom utility classes like `neon-glow-cyan` defined in `globals.css`.

### Types

All shared types in `src/lib/types.ts`: `ScanParams`, `ScanEvent`, `PortResult`, `ScanSummary`, `ScanHistoryEntry`.

### Path alias

`@/*` maps to `./src/*`.
