'use client'

import { ReactNode } from 'react'

interface ProgressRingProps {
  value: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  children?: ReactNode
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference
  const center = size / 2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-none stroke-white/10"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-none stroke-lime transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
