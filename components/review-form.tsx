"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export function ReviewForm({ providerId }: { providerId: string }) {
  const [rating, setRating] = useState<number>(5)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login to submit a review")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("reviews").insert({
      provider_id: providerId,
      reviewer_id: user.id,
      rating,
      content,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Review submitted successfully!")
    setContent("")
    window.location.reload()
  }

  return (
    <form onSubmit={submitReview} className="mt-6 space-y-4 border p-4 rounded">
      <h3 className="text-lg font-semibold">Write a review</h3>

      <Input
        type="number"
        min={1}
        max={5}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />

      <Textarea
        placeholder="Share your experience..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
