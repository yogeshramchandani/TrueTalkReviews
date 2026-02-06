"use client"

import { useState } from "react"

type Breakdown = {
  honesty: number
  responsiveness: number
  activity: number
  penalty: number
}

export function TruVouchScoreRing({
  score,
  breakdown,
}: {
  score: number
  breakdown: Breakdown
}) {
  const [open, setOpen] = useState(false)

  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const ringColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative w-36 h-36 focus:outline-none"
      >
        <svg className="w-full h-full rotate-[-90deg]">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={ringColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-slate-900">{score}</p>
          <p className="text-xs text-slate-500">TruVouch</p>
        </div>
      </button>

      {open && (
        <div className="absolute top-full mt-4 w-64 bg-white border shadow-xl rounded-xl p-4 z-30">
          <p className="text-sm font-semibold text-slate-800 mb-3">
            Trust Breakdown
          </p>

          <BreakRow label="Honesty" value={breakdown.honesty} />
          <BreakRow label="Responsiveness" value={breakdown.responsiveness} />
          <BreakRow label="Activity" value={breakdown.activity} />
          <BreakRow label="Penalty" value={breakdown.penalty} negative />
        </div>
      )}
    </div>
  )
}

function BreakRow({
  label,
  value,
  negative = false,
}: {
  label: string
  value: number
  negative?: boolean
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={negative ? "text-red-600" : "text-slate-900"}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded">
        <div
          className={`h-2 rounded ${
            negative ? "bg-red-400" : "bg-emerald-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
