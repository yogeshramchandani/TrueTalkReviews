"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertTriangle, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export function ReviewActionCard({ review, onUpdate }: { review: any, onUpdate: () => void }) {
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVouch = async () => {
    if (!confirm("Are you sure you want to vouch for this review? This action cannot be undone.")) return;
    
    setLoading(true)
    try {
      const res = await fetch('/api/reviews/vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: review.id,
          professionalId: review.provider_id,
          replyContent: reply
        })
      })
      
      if (res.ok) {
        toast.success("Review verified successfully! Points awarded.")
        onUpdate() // Refresh the dashboard list
      } else {
        toast.error("Error verifying review.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!confirm("Disputing a review removes it from your profile temporarily but requires admin investigation. Proceed?")) return;
    // Implement dispute logic here later
    toast.success("Dispute ticket raised.")
  }

  return (
    <div className="border border-orange-200 bg-orange-50/50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="font-bold">{review.reviewer_name}</span>
             <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Unverified</span>
          </div>
          <div className="flex text-yellow-500 mb-2">
             {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
          </div>
          <p className="text-sm text-slate-700">{review.content}</p>
        </div>
        <div className="text-xs text-slate-400">
           {new Date(review.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-white p-3 rounded border border-orange-100">
        <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
          <MessageSquare className="w-3 h-3"/> Reply & Vouch
        </p>
        <Textarea 
          placeholder="Write a reply to the client (Optional but recommended for +5 Response Score)..." 
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="mb-3 text-xs"
        />
        <div className="flex gap-2 justify-end">
           <Button variant="outline" size="sm" onClick={handleDispute} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
             <AlertTriangle className="w-3 h-3 mr-1"/> Dispute
           </Button>
           <Button size="sm" onClick={handleVouch} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
             <CheckCircle className="w-3 h-3 mr-1"/> Vouch & Verify
           </Button>
        </div>
      </div>
    </div>
  )
}