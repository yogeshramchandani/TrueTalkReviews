"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmailVerificationProps {
  email: string
}

export function EmailVerification({ email }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)

  async function handleResend() {
    setIsResending(true)

    // Simulate resend request
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsResending(false)
  }

  return (
    <Card className="p-6 border border-border">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm">
          We've sent a verification link to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Click the link in the email to verify your address and complete your account setup. The link expires in 24
          hours.
        </p>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Didn't receive the email?</p>
          <Button
            onClick={handleResend}
            disabled={isResending}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary bg-transparent"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Wrong email? </span>
        <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium">
          Create new account
        </Link>
      </div>
    </Card>
  )
}
