"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRef } from "react"

interface Provider {
  name: string
  profession: string
  city: string
}

export default function ShareProfileButton({ provider }: { provider: Provider }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const profileUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = () => {
    if (inputRef.current) {
      inputRef.current.select()
      navigator.clipboard.writeText(profileUrl)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${provider.name} - ${provider.profession}`,
      text: `Check out ${provider.name}'s profile and read reviews from their clients.`,
      url: profileUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled share
      }
    }
  }

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

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Link</label>
            <div className="flex gap-2">
              <Input ref={inputRef} value={profileUrl} readOnly />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                Copy
              </Button>
            </div>
          </div>

          {/* Native Share */}
          {typeof navigator !== "undefined" && navigator.share && (
            <Button onClick={handleShare} className="w-full">
              Share on Social Media
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
