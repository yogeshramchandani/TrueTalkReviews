"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { EditableProfileCard } from "@/components/dashboard/editable-profile-card"
// 1. IMPORT THE RECENT REVIEWS COMPONENT
import { RecentReviews } from "@/components/dashboard/recent-reviews" 
import { Loader2, Star, Users, TrendingUp, LogOut, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Load Data Function
  const loadDashboard = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
      return
    }

    // A. FETCH PROFILE FROM DB
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (error || !profileData) {
      console.error("Profile fetch error:", error)
    }

    // B. FETCH REVIEWS (Explicitly selecting provider_reply to be safe)
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        *,
        provider_reply,
        provider_reply_at
      `)
      .eq("provider_id", session.user.id)
      .order("created_at", { ascending: false })

    setProfile(profileData)
    setReviews(reviewsData || [])
    setLoading(false)
  }, [router])

  // Initial Load
  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Gatekeeper Logic
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'professional') {
           router.push("/") 
        }
      }
    }
    checkAccess()
  }, [])

  // Calculate Stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0"

  const publicUrl = profile?.username ? `/u/${profile.username}` : `/u/${profile?.id}`

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. DASHBOARD HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
  <Image
    src="/logo.png"
    alt="Logo"
    width={128}
    height={32}
    className="h-8 w-auto object-contain"
    priority
  />

  <span className="font-bold text-teal-900 text-lg hidden md:block">
    Provider<span className="text-teal-600">Dashboard</span>
  </span>
</div>


          <div className="flex items-center gap-3">
            <Link href={publicUrl} target="_blank">
              <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-teal-700 border-teal-200 hover:bg-teal-50">
                <ExternalLink className="w-4 h-4" /> View Public Page
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* 2. WELCOME & STATS */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Overview</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rating Card */}
            <Card className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Average Rating</p>
                <h3 className="text-2xl font-bold text-slate-900">{averageRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span></h3>
              </div>
            </Card>

            {/* Reviews Count Card */}
            <Card className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
                <h3 className="text-2xl font-bold text-slate-900">{reviews.length}</h3>
              </div>
            </Card>

            {/* Profile Views */}
            <Card className="p-6 border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Profile Views</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {profile?.views || 0}
                </h3>
              </div>
            </Card>
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile Editor (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Manage Profile</h2>
            <EditableProfileCard 
              profile={profile} 
              onUpdate={loadDashboard} 
            />

            {/* 4. RECENT REVIEWS SECTION - REPLACED MANUAL LOOP WITH COMPONENT */}
            <div className="pt-8">
               {/* Note: RecentReviews component handles its own "No reviews" state and title */}
               <RecentReviews reviews={reviews} profile={profile}/>
            </div>
          </div>

          {/* RIGHT COLUMN: Share & Tips */}
          <div className="space-y-6">
            
            {/* Share Card */}
            <Card className="p-6 border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Share Public Profile</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Send this link to your clients to collect verified reviews.
              </p>
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2 overflow-hidden mb-4">
                <code className="text-xs text-slate-600 truncate">
                  TruVouch.app{publicUrl}
                </code>
              </div>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + publicUrl)
                  alert("Link copied!")
                }}
              >
                Copy Link
              </Button>
            </Card>

            {/* Profile Strength Tip */}
            <div className="bg-teal-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">Profile Tip</h3>
              <p className="text-teal-100 text-sm leading-relaxed mb-4">
                Did you know? Profiles with a <span className="font-bold text-white">profile picture</span> and <span className="font-bold text-white">Instagram link</span> get 3x more inquiries.
              </p>
              <div className="h-1 w-full bg-teal-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 transition-all duration-1000" 
                  style={{ width: profile?.avatar_url && profile?.instagram_url ? '100%' : '50%' }}
                ></div>
              </div>
              <p className="text-xs text-teal-300 mt-2 text-right">
                {profile?.avatar_url && profile?.instagram_url ? 'Profile Strength: Excellent' : 'Profile Strength: Good'}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}