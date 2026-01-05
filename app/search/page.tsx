"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ShieldCheck, Loader2, ArrowLeft, Frown } from "lucide-react"

// We separate the logic component to wrap it in Suspense later (Next.js requirement)
function SearchResults() {
  const searchParams = useSearchParams()
  
  // 1. Get query from URL
  const categoryKey = searchParams.get("category")
  const categoryName = searchParams.get("name") || categoryKey || "Professionals"
  const searchQuery = searchParams.get("q") 

  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      console.log("Searching for:", { categoryKey, searchQuery })

      // 2. Query Supabase
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, profession, avatar_url, city, bio')
        // We look for both roles to be safe
        .in('role', ['professional', 'provider']) 

      if (categoryKey) {
        // Case-insensitive search for profession
        query = query.ilike('profession', `%${categoryKey}%`)
      }
      
      if (searchQuery) {
        // General search box logic
        query = query.or(`profession.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("DB Error:", error)
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [categoryKey, searchQuery])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="container mx-auto px-4">
           <Link href="/categories" className="text-slate-500 hover:text-teal-700 text-sm flex items-center gap-1 mb-4 w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Categories
           </Link>
           <h1 className="text-3xl font-bold text-slate-900 capitalize">
             {categoryName} <span className="text-teal-600">({profiles.length})</span>
           </h1>
           <p className="text-slate-500 mt-2">Verified experts ready to help you.</p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
             <p className="text-slate-400">Finding the best experts...</p>
           </div>
        ) : profiles.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Frown className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-700 mb-2">No professionals found.</h3>
             <p className="text-slate-500 max-w-md mx-auto mb-6">
               We couldn't find any experts matching <strong>"{categoryKey || searchQuery}"</strong>.
             </p>
             <Link href="/categories">
                <Button variant="outline">Browse all Categories</Button>
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all hover:border-teal-200 bg-white duration-300">
                <div className="p-6">
                  {/* Top Section */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-slate-100 group-hover:border-teal-100 transition-colors shadow-sm">
                      <AvatarImage src={profile.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-teal-50 text-teal-800 font-bold text-xl">
                        {profile.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-lg text-slate-900 truncate pr-2 group-hover:text-teal-700 transition-colors">
                           {profile.full_name}
                         </h3>
                         <div className="bg-green-50 text-green-700 p-1 rounded-full shrink-0" title="Verified">
                           <ShieldCheck className="w-4 h-4" />
                         </div>
                      </div>
                      <p className="text-teal-600 text-xs font-bold mb-1 uppercase tracking-wide">
                        {profile.profession || "Professional"}
                      </p>
                      {profile.city && (
                        <div className="flex items-center text-xs text-slate-400">
                          <MapPin className="w-3 h-3 mr-1" /> {profile.city}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed">
                      {profile.bio || "No bio available."}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        <span className="font-bold text-slate-700 text-xs">5.0</span>
                    </div>
                    
                    <Link href={`/u/${profile.username}`} className="flex-1">
                      <Button className="w-full bg-slate-900 text-white hover:bg-teal-700 shadow-md group-hover:shadow-lg transition-all">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// MAIN PAGE COMPONENT
export default function SearchPage() {
  return (
    // We wrap the search logic in Suspense to prevent Next.js build errors
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  )
}