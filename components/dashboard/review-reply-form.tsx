"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare, Pencil, Send } from "lucide-react"
import { toast } from "sonner"

interface ReviewReplyFormProps {
  reviewId: string
  existingReply: string | null
  // 🎯 UPDATED: Now accepts a boolean for pointsAwarded
  onReplySaved: (pointsAwarded?: boolean) => void 
  providerName: string
  professionalId: string 
}

export default function ReviewReplyForm({ 
  reviewId, 
  existingReply, 
  onReplySaved,
  providerName,
  professionalId 
}: ReviewReplyFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentReply, setCurrentReply] = useState(existingReply)
  const [draftText, setDraftText] = useState(existingReply || "")

  useEffect(() => {
    if (existingReply) {
      setCurrentReply(existingReply)
      setDraftText(existingReply)
    }
  }, [existingReply])

 const handleSubmit = async () => {
    if (!draftText.trim()) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          professionalId,
          replyContent: draftText,
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "Failed to update")

      // Update local state
      setCurrentReply(draftText) 
      setIsEditing(false)
      
      // Notify parent component
      onReplySaved(result.pointsAwarded)
      
      toast.success(result.pointsAwarded 
        ? "Response posted and score updated!" 
        : "Response updated."
      )

      // 🎯 FIXED: Only send notification if it's the first time (points were awarded)
      if (result.pointsAwarded) {
        fetch('/api/send-reply-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: reviewId,
            replyText: draftText,
            providerName: providerName
          })
        })
      }

    } catch (error: any) {
      console.error("Error submitting reply:", error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  // --- VIEW MODE ---
  if (currentReply && !isEditing) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 relative group">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs font-bold text-teal-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> 
              Your Response
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{currentReply}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 hover:opacity-100 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-3 h-3" />
            <span className="sr-only">Edit reply</span>
          </Button>
        </div>
      </div>
    )
  }

  // --- IDLE/EDIT MODES ... (Keep same as your current code)
  return (
    <div className="mt-3 space-y-3">
      <Textarea
        placeholder="Write your response here..."
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        className="min-h-[100px] bg-white resize-none focus-visible:ring-teal-500"
      />
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !draftText.trim()}
          size="sm"
          className="bg-teal-700 hover:bg-teal-800 text-white"
        >
          {isSubmitting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
          {isSubmitting ? "Saving..." : "Post Reply"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsEditing(false)
            setDraftText(currentReply || "")
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}