import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - SaaS",
  description: "Sign up or log in to your account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
