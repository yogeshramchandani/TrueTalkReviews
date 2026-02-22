"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { IntegrityGuidelinesDialog } from "./integrity-guidelines"
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Filter, 
  Star,
  MessageSquare,
  History,
  Info,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Menu,
  ArrowDown
} from "lucide-react"
import ReviewReplyForm from "./review-reply-form" 
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

type Review = {
  id: string
  rating: number
  content: string
  created_at: string
  reviewer_name: string | null
  provider_reply: string | null 
  professional_vouch: string | null
  status?: string
}

type RecentReviewsProps = {
  reviews: Review[]
  profile: any
  onActionCompleted: (wasPointEarning?: boolean) => void 
}

export function RecentReviews({ reviews, profile, onActionCompleted }: RecentReviewsProps) {
  const [activeTab, setActiveTab] = useState<'unverified' | 'verified' | 'removed'>('unverified')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'replied' | 'pending_reply'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
const [showGuidelines, setShowGuidelines] = useState(false)
  // --- 🎯 FILTERING & CHRONOLOGICAL SORTING ---
  const filteredReviews = useMemo(() => {
    const sorted = [...reviews].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.filter(r => {
      const isVouched = r.professional_vouch === 'vouched' || r.status === 'vetted';
      const isRemoved = r.status === 'removed';
      const hasReply = r.provider_reply && r.provider_reply.trim().length > 0;

      if (activeTab === 'removed') return isRemoved;
      
      if (activeTab === 'verified') {
        if (!isVouched || isRemoved) return false;
        if (verifiedFilter === 'replied') return hasReply;
        if (verifiedFilter === 'pending_reply') return !hasReply;
        return true;
      }

      return !isRemoved && !isVouched;
    })
  }, [reviews, activeTab, verifiedFilter])

  const unverifiedCount = reviews.filter(r => 
    r.status !== 'removed' && r.professional_vouch !== 'vouched' && r.status !== 'vetted'
  ).length

  const handleVouch = async (reviewId: string) => {
    if (!confirm("Vouching for this review will verify it on your profile. Continue?")) return
    setProcessingId(reviewId)
    
    try {
      const res = await fetch('/api/reviews/vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, professionalId: profile.id })
      })

      // We must parse the JSON to read the custom error message and action flag
      const data = await res.json()

      // 🛑 IF FRAUD DETECTED OR OTHER ERROR
      if (!res.ok) {
        // 1. Show the specific penalty message we wrote in the backend
        toast.error(data.error || "Failed to vouch for review.")

        // 2. Instantly refresh the UI if the backend moved it to the removed section
        if (data.action === 'moved_to_removed') {
           onActionCompleted(true) 
        }
        return // Stop execution here
      }

      // ✅ IF GENUINE VOUCH SUCCESSFUL
      toast.success("Review verified! Points added to score.")
      onActionCompleted(true) 
      
    } catch (err: any) {
      console.error("Vouch Error:", err)
      toast.error("An unexpected error occurred.")
    } finally { 
      setProcessingId(null) 
    }
  }

  const handleDispute = async (reviewId: string) => {
    if (!confirm("Are you sure you want to dispute this review? It will be sent to admin for investigation.")) return
    
    setProcessingId(reviewId)
    try {
      const res = await fetch('/api/reviews/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, professionalId: profile.id })
      })
      
      if (res.ok) {
        toast.success("Dispute raised. Admin will review.")
        onActionCompleted(false) 
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to raise dispute")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    // 📌 Main Container Card
    <Card className="border-none shadow-none lg:border lg:shadow-sm bg-white overflow-visible flex flex-col h-full relative gap-6 py-2">
      
      {/* 📌 STICKY HEADER */}
      <div className="sticky top-[64px] z-40 bg-white border-b border-slate-100 rounded-t-lg shadow-sm lg:shadow-none">
        <CardHeader className="px-4 py-4 md:px-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-6 h-6 text-teal-600" />
                Review Management
              </CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500 mt-1">
                Maintain your TruVouch integrity by verifying genuine client feedback.
              </CardDescription>
            </div>
            
            {unverifiedCount > 0 && activeTab !== 'unverified' && (
               <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full animate-pulse">
                 <div className="w-2 h-2 bg-red-500 rounded-full" />
                 <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                   {unverifiedCount} Action Required
                 </span>
               </div>
            )}
          </div>
          
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
            <TabButton active={activeTab === 'unverified'} onClick={() => setActiveTab('unverified')} label="Pending Vouch" icon={<Clock className="w-4 h-4" />} badge={unverifiedCount > 0} />
            <TabButton active={activeTab === 'verified'} onClick={() => setActiveTab('verified')} label="Verified Reviews" icon={<ShieldCheck className="w-4 h-4" />} />
            <TabButton active={activeTab === 'removed'} onClick={() => setActiveTab('removed')} label="Removed" icon={<Trash2 className="w-4 h-4" />} />
          </div>

          {/* Sub-Filters */}
          {activeTab === 'verified' && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 rounded-md border border-slate-100">
                
              </div>
              <FilterChip label="All Verified" active={verifiedFilter === 'all'} onClick={() => setVerifiedFilter('all')} />
              <FilterChip label="Replied" active={verifiedFilter === 'replied'} onClick={() => setVerifiedFilter('replied')} />
              <FilterChip label="Needs Reply" active={verifiedFilter === 'pending_reply'} onClick={() => setVerifiedFilter('pending_reply')} />
            </div>
          )}
        </CardHeader>
      </div>

      {/* 📜 SCROLLABLE CONTENT (Cards + Spacing) */}
      <CardContent className="p-4 md:px-6 md:py-0 overflow-y-auto max-h-187.5 flex-1 custom-scrollbar bg-slate-50/30">
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center px-6">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                <MessageSquare className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-base font-bold text-slate-400 italic">No {activeTab} reviews found.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ReviewItem 
                key={review.id} 
                review={review} 
                profile={profile} 
                processingId={processingId} 
                handleVouch={handleVouch} 
                handleDispute={handleDispute} // 🟢 Properly passed down here now
                onActionCompleted={onActionCompleted} 
                tab={activeTab} 
              />
            ))
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
          <Info className="w-3 h-3" /> Showing {filteredReviews.length} results
        </p>
        <div onClick={() => setShowGuidelines(true)}
           className="text-[10px] font-black text-teal-600 uppercase flex items-center gap-1 hover:underline cursor-pointer">
          Integrity Guidelines <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
      <IntegrityGuidelinesDialog 
        open={showGuidelines} 
        onOpenChange={setShowGuidelines} 
      />
    </Card>
  )
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label, icon, badge }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center justify-center gap-2 px-5 py-3 text-sm font-black rounded-xl transition-all flex-1 whitespace-nowrap relative",
      active ? "bg-white text-teal-700 shadow-md ring-1 ring-slate-200" : "text-slate-500 hover:text-teal-600 hover:bg-white/40"
    )}>
      {icon} {label}
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
        </span>
      )}
    </button>
  )
}

function FilterChip({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-tight transition-all border shrink-0",
      active 
        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
        : "bg-white text-slate-400 border-slate-200 hover:border-teal-400 hover:text-teal-500 shadow-sm"
    )}>
      {label}
    </button>
  )
}

// 📦 REVIEW ITEM CARD (Updated with Expansion Logic)
function ReviewItem({ review, profile, processingId, handleVouch, handleDispute, onActionCompleted, tab }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const initials = (review.reviewer_name || "A").split(" ").map((n: string) => n[0]).join("").toUpperCase()
  
  // Logic to determine if text is "very big" (e.g. > 180 chars)
  const content = review.content || "";
  const isLongText = content.length > 180; 

  return (
    <Card className="border border-slate-200  mb-4">
      <div className="p-4 md:px-6 md:py-0 flex gap-5 md:gap-6 ">
        
        {/* Avatar Column */}
        <div className="flex flex-col items-center shrink-0">
          <Avatar className="h-12 w-12 border-4 border-white shadow-md ring-1 ring-slate-100">
            <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 text-sm font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header: Name + Date */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-black text-slate-900 text-base tracking-tight leading-none mb-1">
                {review.reviewer_name || "Anonymous Reviewer"}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3", i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />
                ))}
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
              {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* 📝 Review Text with Expansion Logic */}
          <div className="relative mt-3">
             <div className="relative">
               <span className="absolute -left-3 -top-2 text-3xl text-slate-100 font-serif z-0">“</span>
               <p className={cn(
                  "text-sm text-slate-600 leading-relaxed font-medium italic relative z-10 transition-all",
                  !isExpanded && "line-clamp-3" // Limits to 3 lines if not expanded
               )}>
                 {content}
               </p>
             </div>
             
             {/* Read More Button */}
             {isLongText && (
               <button 
                 onClick={() => setIsExpanded(!isExpanded)} 
                 className="mt-2 text-[11px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 uppercase tracking-wide focus:outline-none"
               >
                 {isExpanded ? (
                   <>Show Less <ChevronUp className="w-3 h-3" /></>
                 ) : (
                   <>Read More <ChevronDown className="w-3 h-3" /></>
                 )}
               </button>
             )}
          </div>

          {/* Action Footer */}
          <div className="mt-2 pt-4 border-t border-slate-50">
            {tab === 'unverified' && (
              <div className="flex flex-wrap gap-1">
                <Button 
                  size="sm" 
className="bg-[#1a5353] hover:bg-[#154242] h-9 px-6 font-bold rounded-lg shadow-sm shadow-[#1a5353]/20 text-white transition-colors"
                  onClick={() => handleVouch(review.id)} 
                  disabled={processingId === review.id}
                >
                  {processingId === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CheckCircle className="w-3.5 h-3.5 mr-2" />} 
                  Vouch & Verify
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-slate-400 border-slate-200 h-9 px-4 font-bold rounded-lg hover:text-red-500 hover:bg-red-50 hover:border-red-100"
                  onClick={() => handleDispute(review.id)} 
                  disabled={processingId === review.id}
                >
                  {processingId === review.id ? (
                     <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  ) : (
                     <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                  )}
                  Dispute
                </Button>
              </div>
            )}

            {(tab === 'verified' || review.professional_vouch === 'vouched') && (
              <div className="bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <ReviewReplyForm 
                    providerName={profile?.full_name} 
                    reviewId={review.id} 
                    existingReply={review.provider_reply} 
                    onReplySaved={onActionCompleted} 
                    professionalId={profile.id} 
                  />
              </div>
            )}

            {tab === 'removed' && (
              <div className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 w-fit">
                <Trash2 className="w-3.5 h-3.5" /> 
                <span>REMOVED: TERMS VIOLATION</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
} 