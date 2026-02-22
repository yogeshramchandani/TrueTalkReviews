"use client"
import { motion, AnimatePresence } from "framer-motion"

export function PointsPop({ points }: { points: number | null }) {
  if (!points || points <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ opacity: 1, y: -50, scale: 1.2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 right-0 z-50 pointer-events-none"
      >
        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
          +{points.toFixed(1)} pts
        </span>
      </motion.div>
    </AnimatePresence>
  )
}