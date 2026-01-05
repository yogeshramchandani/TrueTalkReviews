"use client"

import Link from "next/link"
import { useRouter } from "next/navigation" // Needed to refresh page after review
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReviewFormDialog } from "@/components/review-form-dialog" // <--- IMPORT YOUR DIALOG

// Icons
import { 
  Star, MapPin, Globe, Linkedin, Instagram, 
  ShieldCheck, Share2, MessageCircle, CheckCircle2, Pencil, Ban
} from "lucide-react"

// Helper to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

export default function PublicProfile({ profile, reviews, currentUser }: { profile: any, reviews: any[], currentUser: any }) {
  const router = useRouter()
  const hasViewed = useRef(false)
  // STATE
  const [viewer, setViewer] = useState(currentUser)
  const [isReviewOpen, setIsReviewOpen] = useState(false) // <--- DIALOG STATE

  // Client-side auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setViewer(user)
      }
    }
    if (!currentUser) checkUser()
  }, [currentUser])
useEffect(() => {
  const trackView = async () => {
    // 1. Check if we already ran this logic
    if (hasViewed.current) return;
    
    // 2. Mark as run IMMEDIATELY so the second firing stops here
    hasViewed.current = true;

    // 3. Don't count if owner is viewing
    if (currentUser?.id === profile.id) return;

    // 4. Call Supabase
    await supabase.rpc('increment_view_count', { row_id: profile.id })
  }

  trackView()
}, [profile.id, currentUser?.id]) // Run once on load
  // Logic
  const isOwnProfile = viewer?.id === profile.id
  const existingReview = reviews.find(r => r.reviewer_id === viewer?.id)

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0"
  
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { star, count, percentage }
  })

  // --- SMART BUTTON COMPONENT ---
  const ReviewButton = () => {
    // 1. Not Logged In -> Redirect to Login
    if (!viewer) {
      return (
        <Link href={`/auth/login?next=/u/${profile.username}`}>
          <Button className="bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/10 px-6">
            Log in to Review
          </Button>
        </Link>
      )
    }

    // 2. Own Profile -> Disabled
    if (isOwnProfile) {
      return (
        <Button variant="secondary" disabled className="px-6 opacity-70 cursor-not-allowed">
          <Ban className="w-4 h-4 mr-2" /> You can't review yourself
        </Button>
      )
    }

    // 3. Already Reviewed -> "Edit" (Opens Dialog)
    if (existingReview) {
      return (
        <Button 
          variant="outline" 
          className="border-teal-600 text-teal-700 hover:bg-teal-50 px-6"
          onClick={() => setIsReviewOpen(true)} // <--- OPENS DIALOG
        >
          <Pencil className="w-4 h-4 mr-2" /> Edit Your Review
        </Button>
      )
    }

    // 4. New Review -> "Write" (Opens Dialog)
    return (
      <Button 
        className="bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/10 px-6"
        onClick={() => setIsReviewOpen(true)} // <--- OPENS DIALOG
      >
        Write a Review
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- ADD THE DIALOG HERE --- */}
      <ReviewFormDialog 
        open={isReviewOpen} 
        onOpenChange={setIsReviewOpen}
        providerId={profile.id}
        onSuccess={() => {
          setIsReviewOpen(false)
          router.refresh() // <--- Refreshes the page to show the new review instantly
        }}
      />

      {/* 1. HERO HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white shadow-lg bg-slate-100">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold text-teal-800 bg-teal-50">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {profile.full_name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wide border border-teal-100">
                      {profile.profession || "Professional"}
                    </span>
                    {profile.city && (
                      <span className="flex items-center gap-1 text-sm"><MapPin className="w-3.5 h-3.5" /> {profile.city}</span>
                    )}
                  </div>
                </div>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <ReviewButton />
                </div>
              </div>

              {profile.bio && (
                <p className="text-slate-600 max-w-2xl text-lg leading-relaxed border-l-4 border-teal-100 pl-4 mt-4">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border-slate-200 shadow-sm">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-5xl font-extrabold text-slate-900">{averageRating}</span>
                <div className="mb-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? "fill-orange-400 text-orange-400" : "fill-slate-100 text-slate-200"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{totalReviews} verified reviews</p>
                </div>
              </div>
              <div className="space-y-3">
                {distribution.map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-sm">
                    <span className="font-bold w-3 text-slate-700">{item.star}</span>
                    <Star className="w-3 h-3 text-slate-300" />
                    <Progress value={item.percentage} className="h-2 flex-1 bg-slate-100" />
                    <span className="text-slate-400 w-8 text-right text-xs">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm bg-white">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" /> Verified Details
              </h3>
              <div className="space-y-4">
                {profile.phone_number && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-4 h-4 text-green-600" />
                     </div>
                     <span>Phone Verified</span>
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-4">
                  {profile.website_url && (
                    <Link href={profile.website_url} target="_blank" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                      <Globe className="w-4 h-4" /> Website
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Reviews Feed */}
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Recent Reviews <span className="text-slate-400 font-normal text-sm">({totalReviews})</span>
            </h2>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="p-6 md:p-8 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-slate-100">
                          <AvatarFallback className="text-slate-500 font-bold text-xs">
                             {review.reviewer_name ? review.reviewer_name.charAt(0) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{review.reviewer_name || "Anonymous User"}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {/* Only show content if it exists */}
                    {review.content && (
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base mt-2">
                        {review.content}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              // EMPTY STATE
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No reviews yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {profile.full_name} hasn't received any reviews yet.
                </p>
                <div className="flex justify-center">
                  <ReviewButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}