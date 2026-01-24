"use client"

import { Share2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"

// 1. UPDATE INTERFACE: Added 'username' (mandatory) and optional 'id'
interface Provider {
  name: string
  profession: string
  city: string
  username: string // <--- Crucial Addition
  id?: string
}

interface ShareProfileButtonProps {
  provider: Provider
  customTrigger?: React.ReactNode 
}

export default function ShareProfileButton({ provider, customTrigger }: ShareProfileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  // 2. FIX: Use Clean URL Logic
  // We use the username directly. If it's missing for some reason, we fallback to 'undefined' or empty string to avoid crashes.
  const safeUsername = provider.username || provider.id || "unknown"
  const profileUrl = `https://truvouch.app/u/${safeUsername}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
    } catch (err) {
      if (inputRef.current) {
        inputRef.current.select()
        document.execCommand('copy')
        setCopied(true)
      }
    }

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
    } else {
        // Fallback for desktop
        handleCopyLink()
    }
  }

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  return (
    <Dialog>
      <DialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button variant="outline" size="sm" className="w-full md:w-auto gap-2 bg-transparent border-slate-300">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {provider.name}'s Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/70">
            Share this profile with your network and help others discover great work.
          </p>

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
                className="min-w-[80px]"
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

          <Button onClick={handleShare} className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold">
            {canShare ? "Share on Social Media" : "Copy Link to Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}