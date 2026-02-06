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
import { Star, Loader2, ImageIcon } from "lucide-react"

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
  onSuccess: (review: any) => void
}

const MAX_PROOF_SIZE_MB = 2

export function ReviewFormDialog({
  open,
  onOpenChange,
  providerId,
  onSuccess,
}: ReviewFormDialogProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [contentError, setContentError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null)

  // 🧾 Proof
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)

  // ⏱ Time on page
  const startTime = useRef<number>(Date.now())

  const getLetterCount = (text: string) =>
    text.replace(/\s/g, "").length

  useEffect(() => {
    if (open) {
      startTime.current = Date.now()
      checkExistingReview()
    } else {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setRating(0)
    setContent("")
    setContentError(null)
    setHasSubmitted(false)
    setExistingReviewId(null)
    setProofFile(null)
    setProofError(null)
  }

  const checkExistingReview = async () => {
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", providerId)
      .eq("reviewer_id", user.id)
      .maybeSingle()

    if (data) {
      setRating(data.rating)
      setContent(data.content)
      setExistingReviewId(data.id)
    }

    setIsLoading(false)
  }

  const handleProofSelect = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setProofError("Only image files are allowed")
      return
    }

    if (file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
      setProofError(`Max file size is ${MAX_PROOF_SIZE_MB}MB`)
      return
    }

    setProofError(null)
    setProofFile(file)
  }

  const handleSubmit = async () => {
    setHasSubmitted(true)

    if (rating === 0) {
      alert("Please select a star rating")
      return
    }

    if (!content.trim()) {
      setContentError("Review is required")
      return
    }

    if (getLetterCount(content) < 10) {
      setContentError("Minimum 10 letters required")
      return
    }

    setContentError(null)
    setIsSubmitting(true)

    const durationMs = Date.now() - startTime.current

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSubmitting(false)
      return
    }

    // 1️⃣ Save review
    // 1️⃣ Save review
const { data: review, error } = await supabase
  .from("reviews")
  .upsert({
    ...(existingReviewId && { id: existingReviewId }),
    provider_id: providerId,
    reviewer_id: user.id,
    rating,
    content,
    reviewer_name: user.user_metadata?.full_name || "Anonymous",
    submit_duration_ms: durationMs,
    user_agent: navigator.userAgent,
    status: 'processing', // 👈 Explicitly set the lifecycle start
  })
  .select()
  .single()
// 1️⃣.6 Evaluate risk (fire-and-forget)
supabase.functions
  .invoke("evaluate-review-risk", {
    body: {
      review_id: review.id,
    },
  })
  .catch(console.error)

    if (error || !review) {
      alert(error?.message || "Failed to submit review")
      setIsSubmitting(false)
      return
    }

    // 1️⃣.5 Attach IP + risk analysis (NON-BLOCKING, SAFE)
   // 1.5 Attach IP + risk analysis (NON-BLOCKING)
supabase.functions.invoke("attach-review-ip", {
  body: { review_id: review.id }
})



    // 2️⃣ Upload proof (optional)
    if (proofFile) {
      const filePath = `${review.id}/${proofFile.name}`

      const { error: uploadError } = await supabase.storage
        .from("review-proofs")
        .upload(filePath, proofFile, {
          cacheControl: "3600",
          upsert: true,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("review-proofs")
          .getPublicUrl(filePath)

        await supabase
          .from("reviews")
          .update({
            proof_url: urlData.publicUrl,
            proof_size_kb: Math.round(proofFile.size / 1024),
            proof_status: "pending",
          })
          .eq("id", review.id)
          supabase.functions
  .invoke("evaluate-proof-ai", {
    body: { review_id: review.id },
  })
  .catch(console.error)

          supabase.functions
  .invoke("evaluate-review-risk", {
    body: { review_id: review.id },
  })
  .catch(console.error)

      }
    }

    setIsSubmitting(false)
    onSuccess(review)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingReviewId ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            Share your genuine experience. Proof is optional.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* ⭐ Rating */}
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
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

            {/* ✍️ Review */}
            <Textarea
              placeholder="Tell us about your experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />

            {/* 🧾 Proof */}
            <div className="border rounded-lg p-3">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                Optional proof (image, max {MAX_PROOF_SIZE_MB}MB)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleProofSelect(e.target.files?.[0] || null)
                }
              />

              {proofFile && (
                <p className="text-xs mt-1 text-green-600">
                  {proofFile.name} selected
                </p>
              )}

              {proofError && (
                <p className="text-xs mt-1 text-red-500">
                  {proofError}
                </p>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {existingReviewId ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
