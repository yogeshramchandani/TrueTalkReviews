"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { supabase } from "@/lib/supabaseClient"
import { EditableProfileCard } from "@/components/dashboard/editable-profile-card"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { TruVouchScoreRing } from "@/components/dashboard/Truvouchscoring"

import {
  Loader2,
  Star,
  Users,
  TrendingUp,
  LogOut,
  ExternalLink,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* -----------------------------
     LOAD DASHBOARD DATA
  ------------------------------ */
  const loadDashboard = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
      return
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", session.user.id)
      .order("created_at", { ascending: false })

    setProfile(profileData)
    setReviews(reviewsData || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  /* -----------------------------
     ACCESS CONTROL
  ------------------------------ */
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (data?.role !== "professional") {
        router.push("/")
      }
    }
    

    checkAccess()
  }, [router])

  /* -----------------------------
     DERIVED VALUES
  ------------------------------ */
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0"

  const publicUrl = profile?.username
    ? `/u/${profile.username}`
    : `/u/${profile?.id}`

  /* -----------------------------
     LOADING STATE
  ------------------------------ */
  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
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
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">

          {/* LEFT — PROFILE */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="max-w-md">
              <EditableProfileCard
                profile={profile}
                onUpdate={loadDashboard}
              />
            </div>
          </div>

          {/* RIGHT — DASHBOARD */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">

            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col items-center text-center">
                <TruVouchScoreRing
                  score={Math.round(profile.vouch_score || 0)}
                  breakdown={{
                    honesty: Math.round(profile.honesty_score ?? 0),
                    responsiveness: Math.round(profile.responsiveness_score ?? 0),
                    activity: Math.round(profile.activity_score ?? 0),
                    penalty: Math.round(profile.penalty_score ?? 0),
                  }}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Scores stabilize as you receive more reviews
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold">Share Profile</h3>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Send this link to your clients to collect verified reviews.
                </p>

                <div className="bg-slate-100 p-3 rounded-lg mb-4">
                  <code className="text-xs truncate block">
                    TruVouch.app{publicUrl}
                  </code>
                </div>

                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      window.location.origin + publicUrl
                    )
                  }
                >
                  Copy Link
                </Button>
              </Card>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {averageRating}
                    <span className="text-xs text-slate-400"> / 5.0</span>
                  </p>
                </div>
              </Card>

              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Profile Views</p>
                  <p className="text-2xl font-bold">{profile.views || 0}</p>
                </div>
              </Card>

              <Card className="p-6 flex items-center gap-4">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                </div>
              </Card>
            </div>

            {/* ROW 3 */}
            <RecentReviews reviews={reviews} profile={profile} />

          </div>
        </div>
      </main>
    </div>
  )
}
