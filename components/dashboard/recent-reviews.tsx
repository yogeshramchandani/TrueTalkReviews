"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReviewReplyForm from "./review-reply-form" 

type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  reviewer_id: string
  provider_reply: string | null 
}

// 1. UPDATE PROPS TO INCLUDE PROFILE
type RecentReviewsProps = {
  reviews: Review[]
  profile: any // You can replace 'any' with your Profile type if you have one
}

export function RecentReviews({ reviews, profile }: RecentReviewsProps) { // <--- DESTRUCTURE PROFILE
  const router = useRouter()

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  // ... (Keep the renderStars and "No reviews" check same as before) ...

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>No reviews yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Latest feedback from your customers</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-4 pb-6 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex gap-4">
                {/* User Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>
                    {review.reviewer_id ? review.reviewer_id.slice(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">Reviewer</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2">{renderStars(review.rating)}</div>

                  <p className="text-sm text-foreground mt-2 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>

              {/* Reply Section */}
              <div className="pl-14">
                <ReviewReplyForm 
                  // 2. NOW THIS WILL WORK BECAUSE WE HAVE PROFILE
                  providerName={profile?.full_name || "The Professional"}
                  reviewId={review.id}
                  existingReply={review.provider_reply}
                  onReplySaved={() => {
                    router.refresh()
                  }}
                />
              </div>
              
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}