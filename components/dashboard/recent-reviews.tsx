"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  MoreVertical,
  Flag,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import ReviewReplyForm from "./review-reply-form"
import { supabase } from "@/lib/supabaseClient"

/* -------------------------------- TYPES -------------------------------- */

type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  reviewer_id: string | null
  provider_reply: string | null
  provider_reply_at: string | null
  professional_vouch: "vouched" | null
}

type RecentReviewsProps = {
  reviews: Review[] | null
  profile: any
}

/* ----------------------------- COMPONENT ------------------------------ */

export function RecentReviews({ reviews, profile }: RecentReviewsProps) {
  const router = useRouter()

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // 🔐 Vouch dialog state
  const [vouchDialogOpen, setVouchDialogOpen] = useState(false)
  const [pendingVouchId, setPendingVouchId] = useState<string | null>(null)
  const [isVouching, setIsVouching] = useState(false)

  /* ----------------------------- VOUCH ACTION ------------------------------ */

  const confirmVouch = async () => {
  if (!pendingVouchId) return

  setIsVouching(true)

  const { error } = await supabase
    .from("reviews")
    .update({
      professional_vouch: "vouched",
      vouch_at: new Date().toISOString(),
    })
    .eq("id", pendingVouchId)
    .eq("provider_id", profile.id) // ✅ RLS-safe

  if (error) {
    console.error("VOUCH FAILED:", error)
    setIsVouching(false)
    return
  }

  // 🔄 Recalculate score
  const { error: scoreError } = await supabase.rpc(
    "recalculate_provider_score",
    { p_provider_id: profile.id }
  )

  if (scoreError) {
    console.error("SCORE RECALC ERROR:", scoreError)
  }

  setIsVouching(false)
  setPendingVouchId(null)
  setVouchDialogOpen(false)

  router.refresh()
}


  /* ----------------------------- HELPERS ------------------------------ */

  const renderStars = (rating: number) => (
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

  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    )
    return 7 - diffDays
  }

  /* ----------------------------- EMPTY STATES ------------------------------ */

  if (!reviews) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </CardContent>
      </Card>
    )
  }

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

  /* ----------------------------- RENDER ------------------------------ */

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            Latest feedback from your customers
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {reviews.map((review) => {
            const daysLeft = getDaysLeft(review.created_at)
            const isOverdue = daysLeft <= 0
            const isExpanded = expanded[review.id]

            return (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>
                      {review.reviewer_id
                        ? review.reviewer_id.slice(0, 2).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    {/* HEADER */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">Reviewer</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* VOUCH BUTTON */}
                        {review.professional_vouch === null ? (
                          <Button
                            size="sm"
                            disabled={isVouching}
                            className="h-7 px-3 text-xs rounded-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              setPendingVouchId(review.id)
                              setVouchDialogOpen(true)
                            }}
                          >
                            Vouch
                          </Button>
                        ) : (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Vouched
                          </span>
                        )}

                        {/* MENU */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === review.id ? null : review.id
                              )
                            }
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenu === review.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10">
                              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                                <Flag className="w-4 h-4" /> Report
                              </button>
                              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                                <AlertTriangle className="w-4 h-4" /> Dispute
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* STARS */}
                    {renderStars(review.rating)}

                    {/* CONTENT */}
                    <p
                      className={`text-sm text-slate-700 ${
                        isExpanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {review.content}
                    </p>

                    {review.content.length > 120 && (
                      <button
                        className="text-xs text-teal-600"
                        onClick={() =>
                          setExpanded((p) => ({
                            ...p,
                            [review.id]: !p[review.id],
                          }))
                        }
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    {!review.provider_reply_at && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        {!isOverdue ? (
                          <span>
                            Respond within <b>{daysLeft} days</b>
                          </span>
                        ) : (
                          <span className="text-orange-600">
                            Response window expired
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* REPLY */}
                <div className="ml-14 mt-3">
                  <ReviewReplyForm
                    providerName={profile?.full_name || "Professional"}
                    providerId={profile.id}
                    reviewId={review.id}
                    existingReply={review.provider_reply}
                    onReplySaved={() => router.refresh()}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 🔐 VOUCH CONFIRMATION DIALOG */}
      <Dialog open={vouchDialogOpen} onOpenChange={setVouchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-teal-700">
              Vouch for this review?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              By vouching, you confirm this review was written by a real client
              you served. This improves transparency and trust.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setVouchDialogOpen(false)}
              disabled={isVouching}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={confirmVouch}
              disabled={isVouching}
            >
              {isVouching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vouching…
                </>
              ) : (
                "Confirm Vouch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
