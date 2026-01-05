"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: number, review: string) => void | Promise<void>
}

export function ReviewModal({ open, onOpenChange, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const MAX_CHARACTERS = 500

  const handleSubmit = async () => {
    if (rating === null) return
    setIsSubmitting(true)
    try {
      await onSubmit(rating, review)
      setRating(null)
      setReview("")
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingChars = MAX_CHARACTERS - review.length
  const isSubmitDisabled = rating === null || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Review</DialogTitle>
          <DialogDescription>Help others by sharing your experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={32}
                    className={`${
                      rating && rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text Review */}
          <div className="space-y-3">
            <label htmlFor="review" className="text-sm font-medium">
              Your Review
            </label>
            <textarea
              id="review"
              placeholder="Tell us what you think... (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, MAX_CHARACTERS))}
              className="w-full min-h-[120px] p-3 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className={remainingChars < 50 ? "text-amber-600" : ""}>{remainingChars} characters remaining</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
            <div className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Note:</strong> Reviews cannot be edited after submission.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
