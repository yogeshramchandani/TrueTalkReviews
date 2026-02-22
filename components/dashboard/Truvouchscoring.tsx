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
   <div className="relative flex items-center justify-center z-20">
      {/* 1. RESPONSIVE SIZING: w-32 on mobile, w-40 on desktop */}
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative w-32 h-32 sm:w-40 sm:h-40 focus:outline-none shrink-0" 
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle
            cx="72" cy="72" r={radius} stroke={ringColor} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          {/* RESPONSIVE TEXT: Scales up with the ring size */}
          <p className="text-4xl sm:text-4xl font-bold text-slate-900 leading-none">{score}</p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Score
          </p>
        </div>
      </button>

      {/* 2. RESPONSIVE POPUP: Opens below on mobile (top-full), opens right on desktop (sm:left-full) */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 sm:mt-0 sm:top-1/2 sm:-translate-y-1/2 sm:left-full sm:-translate-x-0 sm:ml-6 w-56 bg-white border shadow-2xl rounded-xl p-4 z-50">
          <p className="text-sm font-semibold text-slate-800 mb-3 text-left">
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