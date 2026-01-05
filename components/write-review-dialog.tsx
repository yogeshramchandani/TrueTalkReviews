"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, Lock } from "lucide-react"

interface Props {
  providerId: string
  providerName: string
}

export function WriteReviewDialog({ providerId, providerName }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")

  // 1. AUTH CHECK LOGIC
  const handleTriggerClick = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // User is NOT logged in. Redirect to login, but remember to come back here!
      // We pass the current page URL as a 'next' parameter.
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/auth/login?next=${returnUrl}`)
    } else {
      // User IS logged in. Open the modal.
      setIsOpen(true)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating")
    if (content.length < 10) return alert("Review must be at least 10 characters")
    
    setLoading(true)
    
    try {
      // Get current user (Reviewer)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Insert Review
      const { error } = await supabase
        .from('reviews')
        .insert({
          provider_id: providerId,
          reviewer_id: user.id,
          rating: rating,
          content: content,
          reviewer_name: user.user_metadata?.full_name || "Anonymous"
        })

      if (error) throw error

      alert("Review submitted successfully!")
      setIsOpen(false)
      setRating(0)
      setContent("")
      router.refresh() // Refresh page to show new review
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="lg" onClick={handleTriggerClick} className="shadow-lg">
        <Star className="w-4 h-4 mr-2 fill-current" />
        Write a Review
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate {providerName}</DialogTitle>
            <DialogDescription>
              Share your experience with this professional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Star Rating Selector */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              placeholder="Tell us about the service..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Post Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}