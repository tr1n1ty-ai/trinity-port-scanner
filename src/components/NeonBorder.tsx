'use client';

interface NeonBorderProps {
  color?: 'cyan' | 'magenta' | 'lime';
  children: React.ReactNode;
  className?: string;
}

const colorMap = {
  cyan: 'neon-border-cyan',
  magenta: 'neon-border-magenta',
  lime: 'border border-neon-lime shadow-[0_0_5px_#39ff14,0_0_10px_#39ff14,inset_0_0_5px_rgba(57,255,20,0.1)]',
};

export default function NeonBorder({ color = 'cyan', children, className = '' }: NeonBorderProps) {
  return (
    <div className={`rounded-lg bg-cyber-surface p-4 ${colorMap[color]} ${className}`}>
      {children}
    </div>
  );
}
