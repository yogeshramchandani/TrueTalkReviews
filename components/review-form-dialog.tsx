"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
  onSuccess: (review: any) => void
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  providerId,
  onSuccess,
}: ReviewFormDialogProps) {
  
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null)
  
  const startTime = useRef(Date.now())
  const [userAgent, setUserAgent] = useState("")

  useEffect(() => {
    if (open) {
      setUserAgent(navigator.userAgent)
      startTime.current = Date.now()
      checkExistingReview()
    } else {
      setRating(0)
      setContent("")
      setExistingReviewId(null)
    }
  }, [open])

  const checkExistingReview = async () => {
    setIsLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .eq('reviewer_id', session.user.id)
        .neq('status', 'removed')
        .maybeSingle();

      if (data) {
        setRating(data.rating)
        setContent(data.content)
        setExistingReviewId(data.id)
      } else {
        setRating(0)
        setContent("")
        setExistingReviewId(null)
      }
    }
    setIsLoading(false)
  }

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating")
      return
    }

    if (!content.trim()) {
      toast.error("Please write a review")
      return
    }

    setIsSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error("You must be logged in to submit a review.")
      setIsSubmitting(false)
      return
    }

    const timeTaken = Math.max(0, Math.floor((Date.now() - startTime.current) / 1000))

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: providerId,
          rating,
          content: content.trim(),
          reviewer_name: session.user.user_metadata.full_name || "Anonymous",
          reviewer_email: session.user.email,
          submission_seconds: timeTaken,
          user_agent: userAgent || navigator.userAgent,
          existing_id: existingReviewId 
        })
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to submit")
      
      toast.success(existingReviewId ? "Review updated successfully!" : "Review submitted successfully!")
      onSuccess(result.data)
      onOpenChange(false)
    } catch (error: any) {
      console.error("❌ Submit Error:", error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = isSubmitting || rating === 0 || !content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Changed text colors to teal-900/700 */}
          <DialogTitle className="text-teal-900">{existingReviewId ? "Edit Your Review" : "Write a Review"}</DialogTitle>
          <DialogDescription className="text-slate-600">
            {existingReviewId 
              ? "Update your experience with this professional." 
              : "Share your experience with this professional."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-200" // Changed muted-foreground/30 to slate-200 for cleaner look
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm font-medium text-teal-700 h-5">
              {rating > 0 ? (
                <span>
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Great"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </span>
              ) : "Select a rating"}
            </div>

            <div className="space-y-1">
              <Textarea
                placeholder="Share your experience..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="
                  h-[150px]
                  w-full
                  max-w-full
                  resize-none
                  overflow-y-auto
                  break-words
                  whitespace-pre-wrap
                  break-all
                  focus-visible:ring-teal-500  /* Added teal ring focus */
                "
              />
            </div>
            
            {/* Styled Button with Teal Brand Colors */}
            <Button 
              onClick={handleReviewSubmit} 
              disabled={isButtonDisabled}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingReviewId ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}