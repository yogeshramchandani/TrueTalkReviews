"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Star, Trash2, Loader2, MessageSquare } from "lucide-react"

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)
    // Fetch review + join with profiles for reviewer/receiver names
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(full_name, avatar_url),
        provider:provider_id(full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to permanently delete this review?")) return;
    
    setReviews(reviews.filter(r => r.id !== id))
    await supabase.from('reviews').delete().eq('id', id)
  }

  return (
    <div className="space-y-6">
       <div>
          <div className="text-sm text-slate-400 mb-1">Home › Dashboard › <span className="text-slate-600">Reviews</span></div>
          <h1 className="text-2xl font-bold text-slate-900">Review Moderation</h1>
       </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Review For</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[40%]">Content</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-teal-600"/></TableCell></TableRow>
            ) : reviews.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">No reviews yet.</TableCell></TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} className="group hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">
                     {review.reviewer?.full_name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-teal-600">
                     @{review.provider?.full_name || "Unknown"}
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700">{review.rating}</span>
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                     </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                     <p className="line-clamp-2">{review.content}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-slate-300 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}