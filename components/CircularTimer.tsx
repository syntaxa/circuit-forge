import React from 'react';

interface CircularTimerProps {
  progress: number; // 0 to 1
  label: string;
  subLabel?: string;
  color?: string;
  /** Bilateral exercise: show inner circle split in two halves */
  biSided?: boolean;
  /** true = first half (left filled), false = second half (right filled). Only used when biSided */
  leftHalfActive?: boolean;
}

const INNER_BG = '#1e293b'; // same as ring background
const SIDE_FILL = '#047857'; // darker green than active ring (#10b981)

export const CircularTimer: React.FC<CircularTimerProps> = ({
  progress,
  label,
  subLabel,
  color = '#10b981',
  biSided = false,
  leftHalfActive = true,
}) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const innerRadius = normalizedRadius - stroke / 2; // inside the ring
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  const cx = radius;
  const cy = radius;

  // Semicircles: SVG is rotated -90deg, so view LEFT = SVG TOP (smaller y), view RIGHT = SVG BOTTOM.
  const leftHalfPath = `M ${cx} ${cy} L ${cx - innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 0 1 ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 0 1 ${cx + innerRadius} ${cy} Z`;
  const rightHalfPath = `M ${cx} ${cy} L ${cx + innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 0 1 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 0 1 ${cx - innerRadius} ${cy} Z`;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-300"
      >
        {/* Background Circle */}
        <circle
          stroke={INNER_BG}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={cx}
          cy={cy}
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
          cx={cx}
          cy={cy}
          className="transition-all duration-500 ease-linear"
        />
        {/* Inner circle halves for bilateral exercises (inside the ring only) */}
        {biSided && (
          <g>
            <path
              d={leftHalfPath}
              fill={leftHalfActive ? SIDE_FILL : INNER_BG}
              className="transition-colors duration-500"
            />
            <path
              d={rightHalfPath}
              fill={leftHalfActive ? INNER_BG : SIDE_FILL}
              className="transition-colors duration-500"
            />
          </g>
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black tracking-tighter text-white">{label}</span>
        {subLabel && <span className="text-sm font-medium text-slate-400 uppercase mt-1">{subLabel}</span>}
      </div>
    </div>
  );
};