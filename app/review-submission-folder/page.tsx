"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReviewModal } from "@/components/review-modal"

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)

  const handleReviewSubmit = async (rating: number, review: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Review submitted:", { rating, review })
    alert(`Thanks! You rated us ${rating} stars.`)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">We'd Love Your Feedback</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">Share your experience and help us improve</p>
        <Button onClick={() => setModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          Leave a Review
        </Button>

        <ReviewModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={handleReviewSubmit} />
      </div>
    </main>
  )
}
