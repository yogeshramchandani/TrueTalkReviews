"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, CheckCircle2, Share2 } from "lucide-react"

export function ShareProfileCard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  
  // Construct the full URL (works on localhost and production)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const profileUrl = `${origin}/u/${username}`

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Send this link to your clients to collect verified reviews.
        </p>
        <div className="flex gap-2">
          <Input value={profileUrl} readOnly className="bg-background" />
          <Button onClick={handleCopy} size="icon" variant={copied ? "default" : "outline"}>
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}