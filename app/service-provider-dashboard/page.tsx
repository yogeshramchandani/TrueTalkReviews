"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { supabase } from "@/lib/supabaseClient"
import { EditableProfileCard } from "@/components/dashboard/editable-profile-card"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { TruVouchScoreRing } from "@/components/dashboard/Truvouchscoring"
import { PointsPop } from "@/components/dashboard/PointsPop"

import {
  Loader2,
  Star,
  Users,
  TrendingUp,
  LogOut,
  ExternalLink,
  Mail, 
  ShieldAlert,
  Share2,
  ArrowDownCircle,
  Play
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🆕 ANIMATION STATE
  const [pointsGained, setPointsGained] = useState<number | null>(null)
  const prevScoreRef = useRef<number | null>(null)

  // 🆕 SCROLL HANDLER
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      // Offset by 80px to account for the sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const loadDashboard = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
      return
    }

    // Fetch Profile and Reviews in parallel for speed
    const [profileRes, reviewsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("reviews")
        .select("*")
        .eq("provider_id", session.user.id)
        .order("created_at", { ascending: false })
    ])

    if (profileRes.data) {
      const newScore = profileRes.data.vouch_score || 0
      
      // 🎯 TRIGGER ANIMATION: Compare new score with previous snapshot
      if (prevScoreRef.current !== null && newScore > prevScoreRef.current) {
        setPointsGained(newScore - prevScoreRef.current)
        setTimeout(() => setPointsGained(null), 3000)
      }
      
      prevScoreRef.current = newScore
      setProfile(profileRes.data)
    }

    setReviews(reviewsRes.data || [])
    setLoading(false)
  }, [router])

  // 🎯 REFINED REFRESH HANDLER
  const handleActionCompleted = useCallback((wasPointEarningAction?: boolean) => {
    if (wasPointEarningAction === false) {
      prevScoreRef.current = profile?.vouch_score || null;
    }
    loadDashboard();
  }, [profile?.vouch_score, loadDashboard]);

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    fetch('/api/auth/log-ip', { method: 'POST' })
      .catch(err => console.error("IP Log failed (non-critical)", err));
  }, []);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (data?.role !== "professional") {
        router.push("/")
      }
    }
    checkAccess()
  }, [router])

  const honesty = profile?.honesty_score || 50
  const responsiveness = profile?.responsiveness_score || 0
  const activity = profile?.activity_score || 0
  const calculatedScore = (honesty * 0.5) + (responsiveness * 0.3) + (activity * 0.2)
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"
  const publicUrl = profile?.username ? `/u/${profile.username}` : `/u/${profile?.id}`

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (profile.account_status === 'suspended') {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
        {/* ... (Suspension UI remains same) ... */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your account has been suspended due to <strong>Penalty Score reaching 100% </strong>.
          </p>
          <br />
          <p className="text-slate-600 mb-6 leading-relaxed">
            Email Us at <strong> responsetruvouch@gmail.com </strong>.
          </p>
          <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2" onClick={() => window.location.href = "mailto:responsetruvouch@gmail.com"}>
            <Mail className="w-4 h-4" /> Contact Support
          </Button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="mt-4 text-xs text-slate-400 underline">Log out</button>
        </div>
      </div>
    )
  }

  return (
    // 🎯 FIX 1: Min Height & Flex-Col ensures background covers full screen
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm h-16 flex-none">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={128} height={32} className="h-8 w-auto object-contain" priority />
            <span className="font-bold text-teal-900 text-lg hidden md:block">Provider<span className="text-teal-600">Dashboard</span></span>
          </div>

          <div className="flex items-center gap-3">
            {/* 🎯 FIX 2: Mobile "Jump To" Dropdown */}
            <div className="md:hidden relative">
              <select 
                className="appearance-none bg-slate-100 text-slate-600 text-xs font-bold py-2 pl-3 pr-8 rounded-full border-none focus:ring-2 focus:ring-teal-500 outline-none"
                onChange={(e) => scrollToSection(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Jump to...</option>
                <option value="profile-section">Profile</option>
                <option value="score-section">Score</option>
                <option value="stats-section">Stats</option>
                <option value="reviews-section">Reviews</option>
              </select>
              <ArrowDownCircle className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Desktop Actions */}
            <Link href={publicUrl} target="_blank" className="hidden md:block">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" /> View Public Page
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); router.push("/") }}>
              <LogOut className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 🎯 FIX 3: flex-1 ensures this container pushes footer down/fills height */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          
          <div id="profile-section" className="col-span-12 lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <EditableProfileCard profile={profile} onUpdate={loadDashboard} />
          </div>

          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
            
           {/* 🎯 ID ADDED: SCORE SECTION */}
            <div id="score-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-24">
              
              {/* Added gap-8 for better breathing room */}
              <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 relative overflow-visible">
                
                {/* Left Side: The Ring */}
                <div className="relative z-30 shrink-0">
                  <PointsPop points={pointsGained} /> 
                  <TruVouchScoreRing 
                    score={Math.round(calculatedScore)} 
                    breakdown={{
                      honesty: Math.round(honesty),
                      responsiveness: Math.round(responsiveness),
                      activity: Math.round(activity),
                      penalty: Math.round(profile.penalty_score || 0),
                    }}
                  />
                </div>

                {/* Right Side: Text & Video Button (Added flex-1 to fill space) */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                  <h3 className="text-xl font-bold text-slate-900 sm:mt-0">Your Vouch Score</h3>
                  <p className="mt-2 text-sm text-slate-500 ">
                    Scores reflect real-time platform activity and interactions.
                  </p>

                  <a 
                    href="https://youtu.be/bVVJjoULXEA?si=A5tuYThaTni9ZeeU" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-full transition-colors w-full sm:w-auto shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Learn About TruVouch
                  </a>
                </div>

              </Card>

              {/* ... (Share Profile Card stays here) ... */}
              


              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold">Share Profile</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Send this link to clients to collect verified reviews.</p>
                <div className="bg-slate-100 p-3 rounded-lg mb-4">
                  <code className="text-xs truncate block">TruVouch.app{publicUrl}</code>
                </div>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => { navigator.clipboard.writeText(window.location.origin + publicUrl); toast.success("Link Copied"); }}>
                  Copy Link
                </Button>
              </Card>
            </div>

            {/* 🎯 ID ADDED: STATS SECTION */}
            <div id="stats-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-24">
              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Star className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">Avg Rating</p><p className="text-2xl font-bold">{averageRating}</p></div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">Views</p><p className="text-2xl font-bold">{profile.views || 0}</p></div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-lg"><Users className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">Total Reviews</p><p className="text-2xl font-bold">{reviews.length}</p></div>
              </Card>
            </div>

            {/* 🎯 ID ADDED: REVIEWS SECTION */}
            <div id="reviews-section" className="scroll-mt-24">
              <RecentReviews 
                reviews={reviews} 
                profile={profile} 
                onActionCompleted={handleActionCompleted} 
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}