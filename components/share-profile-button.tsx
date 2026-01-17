"use client"

import { Share2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"

interface Provider {
  name: string
  profession: string
  city: string
}

export default function ShareProfileButton({ provider }: { provider: Provider }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false) // State for visual feedback

  const profileUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = async () => {
    if (!profileUrl) return

    try {
      // 1. Try the modern Clipboard API first
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
    } catch (err) {
      // 2. Fallback: Select text and use execCommand (better compatibility)
      if (inputRef.current) {
        inputRef.current.select()
        document.execCommand('copy')
        setCopied(true)
      }
    }

    // Reset the "Copied" status after 2 seconds
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const shareData = {
      title: `${provider.name} - ${provider.profession}`,
      text: `Check out ${provider.name}'s profile and read reviews from their clients.`,
      url: profileUrl,
    }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Share cancelled")
      }
    }
  }

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full md:w-auto gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {provider.name}'s Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/70">
            Share this profile with your network and help others discover great work.
          </p>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Link</label>
            <div className="flex gap-2">
              <Input 
                ref={inputRef} 
                value={profileUrl} 
                readOnly 
                className="bg-slate-50"
              />
              <Button 
                onClick={handleCopyLink} 
                variant="outline" 
                size="sm"
                className="min-w-[80px]" // Fixed width prevents jumping when text changes
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-green-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Native Share Button (Mobile) */}
          {canShare && (
            <Button onClick={handleShare} className="w-full bg-teal-700 hover:bg-teal-800 text-white">
              Share on Social Media
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}