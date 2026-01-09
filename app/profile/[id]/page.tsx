"use client" // This might be needed if ProfileHeader or other components interact with client side logic, but usually page.tsx can remain server-side if it just passes data. If you get errors, add this back.

import { Star, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ProfileHeader from "@/components/profile-header"
import ReviewsList from "@/components/reviews-list"
// Ensure this import uses curly braces as discussed before
import { WriteReviewDialog } from "@/components/write-review-dialog" 
import ShareProfileButton from "@/components/share-profile-button"

// Mock data - replace with real data from database
const mockProvider = {
  id: "1",
  name: "Sarah Mitchell",
  profession: "Brand Design Strategist",
  city: "San Francisco, CA",
  bio: "With 8+ years of experience in brand identity and design strategy, I help businesses create compelling visual identities that resonate with their target audience. I specialize in logo design, brand guidelines, and comprehensive branding systems for startups and established companies.",
  photo: "/professional-headshot-woman.jpg",
  averageRating: 4.8,
  totalReviews: 47,
}

const mockReviews = [
  {
    id: "1",
    rating: 5,
    text: "Sarah completely transformed our brand identity. Her strategic approach and attention to detail resulted in a cohesive brand system that our team loves. Highly professional and easy to work with.",
    reviewerName: "Michael",
    date: "2 weeks ago",
  },
  {
    id: "2",
    rating: 5,
    text: "Outstanding work on our logo redesign. Sarah understood our vision immediately and delivered multiple concepts that were all exceptional. The final design perfectly captures our company values.",
    reviewerName: "Jennifer",
    date: "1 month ago",
  },
  {
    id: "3",
    rating: 4,
    text: "Great designer with excellent communication. The branding work was thorough and well-executed. The timeline could have been slightly faster, but the quality was worth the wait.",
    reviewerName: "David",
    date: "6 weeks ago",
  },
  {
    id: "4",
    rating: 5,
    text: "Sarah went above and beyond with the brand guidelines documentation. Every detail was considered, and the deliverables were comprehensive. A true professional.",
    reviewerName: "Amanda",
    date: "2 months ago",
  },
]

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <ProfileHeader provider={mockProvider} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Column */}
          <div className="md:col-span-2">
            {/* Bio Section */}
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold">About</h2>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed">{mockProvider.bio}</p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Reviews</h2>
                  <p className="text-foreground/60 text-sm">
                    {mockProvider.totalReviews} clients have reviewed this service
                  </p>
                </div>
                {/* FIX 1: Added providerId */}
                <WriteReviewDialog 
                  providerId={mockProvider.id} 
                  providerName={mockProvider.name} 
                />
              </div>
              <ReviewsList reviews={mockReviews} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Rating & Reviews</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{mockProvider.averageRating}</span>
                    <span className="text-foreground/60">/5</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(mockProvider.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/60">Based on {mockProvider.totalReviews} reviews</p>
                
                {/* FIX 2: Added providerId here as well */}
                <WriteReviewDialog 
                   providerId={mockProvider.id} 
                   providerName={mockProvider.name} 
                />
                
                <ShareProfileButton provider={mockProvider} />
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Quick Info</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{mockProvider.city}</span>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Response Rate</p>
                  <p className="font-medium">98%</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Typical Response Time</p>
                  <p className="font-medium">Within 2 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}