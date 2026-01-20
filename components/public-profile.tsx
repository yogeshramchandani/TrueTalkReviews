"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReviewFormDialog } from "@/components/review-form-dialog"
import ShareProfileButton from "@/components/share-profile-button"
import { Input } from "@/components/ui/input" 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Icons
import { 
  Star, MapPin, Globe, Linkedin, Instagram, Twitter, Facebook,
  Ban, Pencil, Filter, Share2, Search, X, Check, Mail
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
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 2C8.27812 2 2 8.27812 2 16C2 23.7219 8.27812 30 16 30C23.7219 30 30 23.7219 30 16C30 8.27812 23.7219 2 16 2Z" fill="#FC471E"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z" fill="white"/>
  </svg>
)

export default function PublicProfile({ profile, reviews, currentUser }: { profile: any, reviews: any[], currentUser: any }) {
  const router = useRouter()
  const hasViewed = useRef(false)
  
  // STATE
  const [viewer, setViewer] = useState(currentUser)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  
  // Complex Filter State
  const [activeFilters, setActiveFilters] = useState({
    rating: null as number | null,
    verified: false,
    replies: false,
    date: 'all' as 'all' | '30days' | '3months' | '6months'
  })

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

  // --- FILTERING LOGIC ---
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const contentMatch = review.content?.toLowerCase().includes(query)
        const nameMatch = review.reviewer_name?.toLowerCase().includes(query)
        if (!contentMatch && !nameMatch) return false
      }

      // 2. Rating Filter
      if (activeFilters.rating !== null && review.rating !== activeFilters.rating) {
        return false
      }

      // 3. Verified Filter
      if (activeFilters.verified && !review.is_verified) { 
         // return false 
      }

      // 4. Replies Filter
      if (activeFilters.replies && !review.reply_content) {
        return false
      }

      // 5. Date Filter
      if (activeFilters.date !== 'all') {
        const reviewDate = new Date(review.created_at).getTime()
        const now = Date.now()
        const day = 24 * 60 * 60 * 1000
        
        let cutoff = 0
        if (activeFilters.date === '30days') cutoff = 30 * day
        if (activeFilters.date === '3months') cutoff = 90 * day
        if (activeFilters.date === '6months') cutoff = 180 * day

        if (now - reviewDate > cutoff) return false
      }

      return true
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [reviews, searchQuery, activeFilters])


  // Socials
  const socialLinks = [
    { key: 'instagram', icon: Instagram, url: profile.instagram_url },
    { key: 'linkedin', icon: Linkedin, url: profile.linkedin_url },
    { key: 'twitter', icon: Twitter, url: profile.twitter_url },
    { key: 'facebook', icon: Facebook, url: profile.facebook_url },
    { key: 'reddit', icon: RedditIcon, url: profile.reddit_url },
  ].filter(link => link.url && link.url.trim() !== "")

  // Check if any filter is active for the dot indicator
  const isFilterActive = activeFilters.rating || activeFilters.verified || activeFilters.replies || activeFilters.date !== 'all'

  // --- SUB-COMPONENTS ---

  // --- UPDATED REVIEW BUTTON COMPONENT ---
  const ReviewButton = ({ fullWidth = false, size = "default" }: { fullWidth?: boolean, size?: "default" | "sm" | "lg" }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Standard button styles
    const btnClass = `${fullWidth ? 'w-full' : ''} bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-full shadow-sm`

    // 1. Handle Google Login Logic
    const handleGoogleLogin = async () => {
      setIsLoading(true)
      const nextUrl = `/u/${profile.username}`
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        alert("Error logging in: " + error.message)
        setIsLoading(false)
      }
    }

    // 2. State: NOT LOGGED IN -> Show Login Options Modal
    if (!viewer) {
      return (
        <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
          <DialogTrigger asChild>
            <Button size={size} className={btnClass}>
              Log in to Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">Sign in to continue</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-center text-slate-500 text-sm mb-2">
                Please sign in to share your experience with {profile.full_name}.
              </p>
              
              {/* Option A: Continue with Google */}
              <Button 
                variant="outline" 
                className="w-full h-12 relative flex items-center justify-center gap-3 text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {/* Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or</span></div>
              </div>

              {/* Option B: Continue with Email (Redirects to Login Page) */}
              <Link href={`/auth/login?next=/u/${profile.username}`} className="w-full">
                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white gap-3">
                  <Mail className="w-5 h-5" />
                  Continue with Email
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    // 3. State: LOGGED IN (Owner)
    if (isOwnProfile) {
      return (
        <Button variant="secondary" size={size} disabled className={`${fullWidth ? 'w-full' : ''} bg-slate-100 text-slate-400 opacity-70 cursor-not-allowed rounded-full`}>
          <Ban className="w-4 h-4 mr-2" /> Can't review yourself
        </Button>
      )
    }

    // 4. State: LOGGED IN (Has Reviewed) -> Edit
    if (existingReview) {
      return (
        <Button 
          variant="outline" 
          size={size}
          className={`${fullWidth ? 'w-full' : ''} border-teal-600 text-teal-700 hover:bg-teal-50 rounded-full`}
          onClick={() => setIsReviewOpen(true)}
        >
          <Pencil className="w-4 h-4 mr-2" /> Edit Review
        </Button>
      )
    }

    // 5. State: LOGGED IN (New Review) -> Write
    return (
      <Button 
        size={size}
        className={btnClass}
        onClick={() => setIsReviewOpen(true)}
      >
        Write a Review
      </Button>
    )
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#F4F2EE] font-sans text-slate-900">
      
      <ReviewFormDialog 
        open={isReviewOpen} 
        onOpenChange={setIsReviewOpen}
        providerId={profile.id}
        onSuccess={() => {
          setIsReviewOpen(false)
          router.refresh()
        }}
      />

      {/* --- SHARED FILTER MODAL --- */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Filter by</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Rating Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Rating</h3>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const isActive = activeFilters.rating === star
                    return (
                      <button
                        key={star}
                        onClick={() => setActiveFilters(prev => ({ ...prev, rating: isActive ? null : star }))}
                        className={`flex-1 h-10 border rounded flex items-center justify-center gap-1.5 text-sm font-medium transition-all
                          ${isActive 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                          }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isActive ? 'fill-white' : 'fill-slate-700'}`} />
                        {star}
                      </button>
                    )
                  })}
                </div>
              </div>

              

              {/* Date Posted Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Date posted</h3>
                <div className="space-y-2">
                  {[
                    { val: 'all', label: 'All reviews' },
                    { val: '30days', label: 'Last 30 days' },
                    { val: '3months', label: 'Last 3 months' },
                    { val: '6months', label: 'Last 6 months' }
                  ].map((option) => (
                    <label key={option.val} className="flex items-center gap-3 cursor-pointer py-1">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="date_posted"
                          className="peer h-5 w-5 appearance-none border border-slate-300 rounded-full bg-white checked:border-blue-600 checked:border-[6px] transition-all"
                          checked={activeFilters.date === option.val}
                          onChange={() => setActiveFilters(prev => ({ ...prev, date: option.val as any }))}
                        />
                      </div>
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button 
                onClick={() => setActiveFilters({ rating: null, verified: false, replies: false, date: 'all' })}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 hover:underline px-2"
              >
                Reset
              </button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                onClick={() => setShowFilterModal(false)}
              >
                Show {filteredReviews.length} reviews
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* ============================================================
          📱 MOBILE LAYOUT 
      ============================================================ */}
      <div className="block md:hidden bg-white min-h-screen pb-12">
          {/* Header Area */}
          <div className="h-28 w-full bg-slate-200 relative"></div>
          <div className="px-4 relative">
             <div className="flex justify-between items-end -mt-10 mb-4">
               <Avatar className="h-24 w-24 border-[3px] border-white bg-white shadow-sm z-10">
                  <AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?v=${new Date().getTime()}` : undefined} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold text-slate-500 bg-slate-100">{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 flex gap-2 shadow-sm mb-1 z-10">
                  {socialLinks.map((social) => (
                    <a key={social.key} href={social.url} target="_blank" className={`p-1.5 rounded-full bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors`}>
                       <social.icon className="w-4 h-4" />
                    </a>
                  ))}
               </div>
            </div>
            
            {/* Info */}
            <div className="mb-4">
               <h1 className="text-2xl font-bold text-slate-900 leading-tight">{profile.full_name}</h1>
               <p className="text-slate-600 text-sm mt-0.5">{profile.profession || "Professional"}</p>
               {profile.city && (
                 <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                    <MapPin className="w-3 h-3" /> <span>{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>
                 </div>
               )}
            </div>
            
            <div className="flex gap-3 mb-6">
                <div className="flex-1"><ReviewButton fullWidth size="default" /></div>
                <ShareProfileButton provider={{ name: profile.full_name, profession: profile.profession, city: profile.city }} customTrigger={<Button variant="outline" className="h-10 w-10 rounded-full border-slate-300 p-0 flex items-center justify-center"><Share2 className="w-5 h-5 text-slate-600" /></Button>} />
            </div>
            
            {/* Stats */}
            <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-center justify-center w-[100px] shrink-0 border-r border-slate-100 pr-4">
                        <span className="text-4xl font-black text-slate-900 leading-none mb-1">{averageRating}</span>
                        <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-3 h-3 ${star <= Math.round(Number(averageRating)) ? "fill-emerald-500 text-emerald-500" : "fill-slate-200 text-slate-200"}`} />))}
                        </div>
                        <p className="text-[10px] text-slate-500 text-center font-medium">{totalReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5 py-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const item = distribution.find(d => d.star === star) || { count: 0, percentage: 0 }
                            return (<div key={star} className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-600 w-2">{star}</span><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }}/></div></div>)
                        })}
                    </div>
                </div>
            </div>

            {/* 👇 UPDATED MOBILE REVIEWS SECTION WITH FILTERS 👇 */}
            <div>
               <div className="flex flex-col gap-3 mb-4">
                 <h3 className="text-lg font-bold text-slate-900">Reviews</h3>
                 
                 <div className="flex gap-2">
                    {/* Mobile Search */}
                    <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input 
                         placeholder="Search..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-9 h-10 rounded-full bg-slate-50 border-slate-200 text-sm focus:bg-white transition-colors"
                       />
                    </div>
                    
                    {/* Mobile Filter Button */}
                    <Button 
                       variant="outline" 
                       size="icon" 
                       className="h-10 w-10 shrink-0 rounded-full border-slate-200 relative"
                       onClick={() => setShowFilterModal(true)}
                    >
                       <Filter className="w-4 h-4 text-slate-600" />
                       {isFilterActive && (
                         <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-blue-600 border-2 border-white"></span>
                       )}
                    </Button>
                 </div>
               </div>
               
               {/* Mobile List Rendering (Mapped from filteredReviews) */}
               <div className="space-y-3">
                   {filteredReviews.length > 0 ? (
                       filteredReviews.map((review: any) => (
                            <div key={review.id} className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                               <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-8 w-8 bg-slate-100">
                                    <AvatarFallback className="text-[10px]">{review.reviewer_name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900 leading-none">{review.reviewer_name || "User"}</p>
                                     <div className="flex text-orange-400 mt-0.5">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current"/>)}
                                     </div>
                                  </div>
                                  <span className="ml-auto text-[10px] text-slate-400">{formatDate(review.created_at)}</span>
                               </div>
                               <p className="text-slate-600 text-sm leading-relaxed line-clamp-6">{review.content}</p>
                            </div>
                       ))
                   ) : (
                       <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          <p className="text-slate-400 text-sm">No reviews found.</p>
                          <button onClick={() => { setSearchQuery(""); setActiveFilters({ rating: null, verified: false, replies: false, date: 'all' }) }} className="text-blue-600 text-xs font-bold mt-2">Clear Filters</button>
                       </div>
                   )}
               </div>
            </div>

          </div>
      </div>


      {/* ============================================================
          💻 DESKTOP LAYOUT (Unchanged structure, using same logic)
      ============================================================ */}
      <div className="hidden md:block container mx-auto max-w-282 pt-6 px-0">
         <div className="grid grid-cols-12 gap-6">
            
            <div className="col-span-8 space-y-4">
                <div className="bg-white rounded-xl border border-slate-300 overflow-hidden relative">
                   <div className="h-48 w-full bg-[#A0B4B7] relative"></div>
                   <div className="px-6 pb-6 relative">
                      <div className="-mt-24 mb-4 inline-block rounded-full border-4 border-white bg-white">
                         <Avatar className="h-40 w-40"><AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?v=${new Date().getTime()}` : undefined} className="object-cover" /><AvatarFallback className="text-6xl font-bold text-slate-400 bg-slate-100">{profile.full_name?.charAt(0)}</AvatarFallback></Avatar>
                      </div>
                      <div className="flex justify-between items-start">
                         <div>
                            <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                            <p className="text-base text-slate-700 mt-1 font-medium">{profile.profession || "Professional"}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                               {profile.city && (<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>)}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-300 p-6">
                   <h2 className="text-xl font-bold text-slate-900 mb-3">About</h2>
                   <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio || "No bio provided."}</p>
                </div>
            </div>

            <div className="col-span-4 space-y-4">
                <Card className="p-6 border-slate-200 shadow-sm">
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-5xl font-extrabold text-slate-900">{averageRating}</span>
                    <div className="mb-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? "fill-emerald-500 text-emerald-500" : "fill-slate-200 text-slate-200"}`} />))}
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
               <div className="space-y-1">
  <ReviewButton fullWidth />
  <ShareProfileButton 
    provider={{ name: profile.full_name, profession: profile.profession, city: profile.city }} 
    customTrigger={
      <Button 
        variant="outline" 
        className="w-full rounded-full border-slate-600 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-900 font-semibold mt-4"
      >
        <Share2 className="w-4 h-4 mr-2" /> Share Profile
      </Button>
    }
  />
</div>
                <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-sm">
                   <h3 className="text-sm font-bold text-slate-900 mb-3">Connect</h3>
                   <div className="flex flex-wrap gap-3">
                      {socialLinks.map((social) => (<a key={social.key} href={social.url} target="_blank" className={`p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors`}><social.icon className="w-5 h-5" /></a>))}
                   </div>
                </div>
            </div>

         </div>

         {/* DESKTOP REVIEWS */}
         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Recent Reviews</h3>
                <div className="flex items-center gap-3">
                   <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                         placeholder="Search reviews..." 
                         className="pl-9 h-10 rounded-full border-slate-300 focus:border-blue-500"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <Button 
                      variant="outline" 
                      className="rounded-full border-slate-600 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-900 gap-2 h-10 px-4"
                      onClick={() => setShowFilterModal(true)}
                   >
                      <Filter className="w-4 h-4" />
                      Filters
                      {isFilterActive && <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>}
                   </Button>
                </div>
            </div>

            <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {filteredReviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredReviews.map((review: any) => (
                       <div key={review.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow h-fit">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-slate-100">
                                   <AvatarFallback className="text-slate-500 font-bold text-xs">{review.reviewer_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                   <p className="font-bold text-sm text-slate-900">{review.reviewer_name || "User"}</p>
                                   <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
                                </div>
                             </div>
                             <div className="flex text-amber-400">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current"/>)}
                             </div>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed">{review.content}</p>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No reviews match your filters.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

    </div>
  )
}