import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRINITY // Port Scanner",
  description: "Cyberpunk network reconnaissance tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-mono">
        <nav className="border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-neon-cyan neon-glow-cyan tracking-widest">
              TRINITY
            </Link>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-sm text-neon-cyan/70 hover:text-neon-cyan transition-colors"
              >
                SCAN
              </Link>
              <Link
                href="/history"
                className="text-sm text-neon-magenta/70 hover:text-neon-magenta transition-colors"
              >
                HISTORY
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-cyber-border py-3 text-center text-xs text-neon-cyan/30">
          TRINITY v1.0 // LOCAL RECONNAISSANCE TOOL
        </footer>
      </body>
    </html>
  );
}
