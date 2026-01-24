"use client"

import { motion } from "framer-motion"

export default function FadeIn({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start: Invisible and slightly down
      whileInView={{ opacity: 1, y: 0 }} // End: Visible and in place
      viewport={{ once: true, margin: "-50px" }} // Trigger: When element is 50px inside viewport
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }} // Smoothness
      className={className}
    >
      {children}
    </motion.div>
  )
}