import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Review {
  id: string
  rating: number
  text: string
  reviewerName: string
  date: string
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-6">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{review.rating}.0</span>
            </div>

            {/* Review Text */}
            <p className="text-foreground/80 mb-4 leading-relaxed">{review.text}</p>

            {/* Reviewer Info */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium text-sm">{review.reviewerName}</p>
                <p className="text-xs text-foreground/50">{review.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
