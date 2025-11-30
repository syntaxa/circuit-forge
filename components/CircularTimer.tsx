import React from 'react';

interface CircularTimerProps {
  progress: number; // 0 to 1
  label: string;
  subLabel?: string;
  color?: string;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ progress, label, subLabel, color = '#10b981' }) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-300"
      >
        {/* Background Circle */}
        <circle
          stroke="#1e293b"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-linear"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black tracking-tighter text-white">{label}</span>
        {subLabel && <span className="text-sm font-medium text-slate-400 uppercase mt-1">{subLabel}</span>}
      </div>
    </div>
  );
};