"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReviewFormDialog } from "@/components/review-form-dialog"
// 👇 1. IMPORT THE SHARE BUTTON
import ShareProfileButton from "@/components/share-profile-button"

// Icons
import { 
  Star, MapPin, Globe, Linkedin, Instagram, Twitter, Facebook,
  ShieldCheck, MessageCircle, Pencil, Ban, Phone
} from "lucide-react"

// --- 1. HELPER COMPONENTS & FUNCTIONS ---

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

// Custom Reddit Icon
const RedditIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M16 2C8.27812 2 2 8.27812 2 16C2 23.7219 8.27812 30 16 30C23.7219 30 30 23.7219 30 16C30 8.27812 23.7219 2 16 2Z" fill="#FC471E"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z" fill="white"/>
  </svg>
)

// --- 2. MAIN COMPONENT ---

export default function PublicProfile({ profile, reviews, currentUser }: { profile: any, reviews: any[], currentUser: any }) {
  const router = useRouter()
  const hasViewed = useRef(false)
  
  // STATE
  const [viewer, setViewer] = useState(currentUser)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

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

  // View Tracking
  useEffect(() => {
    const trackView = async () => {
      if (hasViewed.current) return;
      hasViewed.current = true;
      if (currentUser?.id === profile.id) return;
      await supabase.rpc('increment_view_count', { row_id: profile.id })
    }
    trackView()
  }, [profile.id, currentUser?.id])

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

  // --- SOCIAL MEDIA LOGIC ---
  const socialLinks = [
    { 
      key: 'instagram', 
      icon: Instagram, 
      url: profile.instagram_url, 
      color: 'text-pink-600 hover:text-pink-700', 
      bg: 'hover:bg-pink-50' 
    },
    { 
      key: 'linkedin', 
      icon: Linkedin, 
      url: profile.linkedin_url, 
      color: 'text-blue-700 hover:text-blue-800', 
      bg: 'hover:bg-blue-50' 
    },
    { 
      key: 'twitter', 
      icon: Twitter, 
      url: profile.twitter_url, 
      color: 'text-sky-500 hover:text-sky-600', 
      bg: 'hover:bg-sky-50' 
    },
    { 
      key: 'facebook', 
      icon: Facebook, 
      url: profile.facebook_url, 
      color: 'text-blue-600 hover:text-blue-700', 
      bg: 'hover:bg-blue-50' 
    },
    { 
      key: 'reddit', 
      icon: RedditIcon, 
      url: profile.reddit_url, 
      color: 'text-orange-600 hover:text-orange-700', 
      bg: 'hover:bg-orange-50' 
    },
  ].filter(link => link.url && link.url.trim() !== "")

  // --- LOCATION LOGIC ---
  const locationParts = [profile.address, profile.city, profile.state].filter(Boolean)
  const fullLocation = locationParts.join(", ")

  // --- SMART BUTTON COMPONENT ---
  const ReviewButton = () => {
    if (!viewer) {
      return (
        <Link href={`/auth/login?next=/u/${profile.username}`} className="w-full">
          <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/10 px-6">
            Log in to Review
          </Button>
        </Link>
      )
    }

    if (isOwnProfile) {
      return (
        <Button variant="secondary" disabled className="w-full px-6 opacity-70 cursor-not-allowed">
          <Ban className="w-4 h-4 mr-2" /> You can't review yourself
        </Button>
      )
    }

    if (existingReview) {
      return (
        <Button 
          variant="outline" 
          className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 px-6"
          onClick={() => setIsReviewOpen(true)}
        >
          <Pencil className="w-4 h-4 mr-2" /> Edit Your Review
        </Button>
      )
    }

    return (
      <Button 
        className="w-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/10 px-6"
        onClick={() => setIsReviewOpen(true)}
      >
        Write a Review
      </Button>
    )
  }

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <ReviewFormDialog 
        open={isReviewOpen} 
        onOpenChange={setIsReviewOpen}
        providerId={profile.id}
        onSuccess={() => {
          setIsReviewOpen(false)
          router.refresh()
        }}
      />

      {/* 1. HERO HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white shadow-lg bg-slate-100">
                <AvatarImage 
                  src={`${profile.avatar_url}?v=${new Date().getTime()}`} 
                  className="object-cover" 
                />
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

                {/* --- FIX: ACTIONS (Visible on Mobile & Desktop) --- */}
                <div className="flex gap-3 mt-4 md:mt-0 md:ml-auto w-full md:w-auto">
                  
                  {/* 👇 2. REPLACE THE DUMB BUTTON WITH THE SMART SHARE BUTTON */}
                  <div className="flex-1 md:flex-none">
                     <ShareProfileButton 
                        provider={{
                           name: profile.full_name,
                           profession: profile.profession || "Professional",
                           city: profile.city || ""
                        }} 
                     />
                  </div>

                  <div className="flex-1 md:flex-none">
                     <ReviewButton />
                  </div>
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
                
                {/* 1. Phone Number */}
                {profile.phone_number && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                      <p className="font-medium text-slate-900">{profile.phone_number}</p>
                    </div>
                  </div>
                )}

                {/* 2. Full Location (Address, City, State) */}
                {fullLocation && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                      <p className="font-medium text-slate-900">{fullLocation}</p>
                    </div>
                  </div>
                )}

                {/* 3. Website */}
                {profile.website_url && (
                  <div className="pt-2">
                    <Link href={profile.website_url} target="_blank" className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                      <Globe className="w-4 h-4" /> Visit Website
                    </Link>
                  </div>
                )}

                {/* 4. Social Icons */}
                {socialLinks.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Connect</p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((social) => (
                        <a 
                          key={social.key}
                          href={social.url.startsWith('http') ? social.url : `https://${social.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2.5 rounded-full bg-slate-50 transition-all duration-200 ${social.color} ${social.bg}`}
                          title={social.key}
                        >
                          <social.icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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
                <div className="flex justify-center w-full">
                   <div className="w-full max-w-xs">
                    <ReviewButton />
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}