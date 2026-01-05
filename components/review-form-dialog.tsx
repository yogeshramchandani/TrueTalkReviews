"use client"

import { useState, useEffect } from "react"
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
  const [isLoading, setIsLoading] = useState(true) // For fetching existing review
  const [hoveredRating, setHoveredRating] = useState(0)
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null)

  // Fetch existing review when dialog opens
  useEffect(() => {
    if (open) {
      checkExistingReview()
    } else {
      // Reset state when closed
      setRating(0)
      setContent("")
      setExistingReviewId(null)
    }
  }, [open])

  const checkExistingReview = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .eq('reviewer_id', user.id)
        .single()

      if (data) {
        setRating(data.rating)
        setContent(data.content)
        setExistingReviewId(data.id)
      }
    }
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating")
      return
    }

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsSubmitting(false)
      return
    }

    // Use Upsert: Updates if exists, Inserts if new
    const { data, error } = await supabase
      .from("reviews")
      .upsert({
        ...(existingReviewId && { id: existingReviewId }), // Only add ID if editing
        provider_id: providerId,
        reviewer_id: user.id,
        rating,
        content,
        reviewer_name: user.user_metadata.full_name || "Anonymous"
      })
      .select()
      .single()

    setIsSubmitting(false)

    if (error) {
      alert(error.message)
      return
    }

    onSuccess(data) // Pass the new/updated review back to the parent
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingReviewId ? "Edit Your Review" : "Write a Review"}</DialogTitle>
          <DialogDescription>
            {existingReviewId 
              ? "Update your experience with this professional." 
              : "Share your experience with this professional."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm font-medium text-muted-foreground h-5">
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

            <Textarea
              placeholder="Tell us more about your experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingReviewId ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}