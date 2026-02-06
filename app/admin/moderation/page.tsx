"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { ShieldAlert, CheckCircle, Trash2, ExternalLink, Loader2 } from "lucide-react"

// 1. Define the Review interface to fix the "errors everywhere"
interface FlaggedReview {
  review_id: string
  created_at: string
  rating: number
  review_text: string
  reviewer_name: string
  status: string
  reviewer_ip_hash: string
  proof_url: string | null
  risk_reason: string
  professional_name: string
  professional_ip_hash: string
  professional_email: string
}

export default function AdminModeration() {
  const [reviews, setReviews] = useState<FlaggedReview[]>([]) // Add type here
  const [loading, setLoading] = useState(true)

  // 2. Fetch the data using the custom SQL join logic
  const fetchFlaggedReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        review_id:id,
        created_at,
        rating,
        review_text:content,
        reviewer_name,
        status,
        reviewer_ip_hash:ip_hash,
        proof_url,
        risk_reason,
        profiles!fk_reviews_provider (
          professional_name:full_name,
          professional_ip_hash:last_login_ip_hash,
          professional_email:email
        )
      `)
      .in('status', ['flagged', 'under_review'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Fetch error:", error)
    } else {
      // Flatten the profile data into the review object for easier mapping
      const flattened = (data as any[]).map(r => ({
        ...r,
        professional_name: r.profiles.professional_name,
        professional_ip_hash: r.profiles.professional_ip_hash,
        professional_email: r.profiles.professional_email
      }))
      setReviews(flattened)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFlaggedReviews()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) {
      // Refresh the list locally
      setReviews(reviews.filter(r => r.review_id !== id))
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-teal-700" />
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Security & Audit Queue</h1>
      
      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
          <p className="text-slate-500">No reviews currently flagged for audit. Good job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.review_id} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-red-50 p-3 border-b border-red-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <p className="text-sm font-bold text-red-700">{review.risk_reason || "Suspected Duplicate/Self Review"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Left Column */}
                <div className="p-6">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-2">Reviewer: {review.reviewer_name}</p>
                  <div className="flex gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => <span key={i}>⭐</span>)}
                  </div>
                  <p className="text-slate-700 italic">"{review.review_text}"</p>
                  
                  {review.proof_url && (
                    <a href={review.proof_url} target="_blank" className="mt-4 inline-flex items-center gap-2 text-teal-700 font-bold text-sm hover:underline">
                      <ExternalLink className="w-4 h-4" /> View Submitted Proof
                    </a>
                  )}
                </div>

                {/* Right Column */}
                <div className="p-6 bg-slate-50">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-2">Conflict with: {review.professional_name}</p>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Reviewer IP Hash</p>
                      <code className="text-[11px] break-all text-red-600">{review.reviewer_ip_hash}</code>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Professional Login Hash</p>
                      <code className="text-[11px] break-all text-slate-600">{review.professional_ip_hash || 'N/A (No Login Record)'}</code>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button onClick={() => handleUpdateStatus(review.review_id, 'vetted')} className="bg-green-600 hover:bg-green-700 text-white flex-1 h-10">
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button onClick={() => handleUpdateStatus(review.review_id, 'removed')} variant="destructive" className="flex-1 h-10">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Fake
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}