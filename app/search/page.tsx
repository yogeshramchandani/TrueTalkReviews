"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Added Input
import { Card } from "@/components/ui/card"
import { MapPin, Star, ShieldCheck, Loader2, ArrowLeft, Frown, Search } from "lucide-react" // Added Search

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 1. Get query from URL
  const categoryKey = searchParams.get("category")
  const sector = searchParams.get("sector")
  const categoryName = searchParams.get("name") || categoryKey || "Professionals"
  const searchQuery = searchParams.get("q") 

  // --- LOCAL SEARCH STATE ---
  const [localSearch, setLocalSearch] = useState(searchQuery || categoryKey || "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fallback link
  const backLink = sector 
    ? `/categories?sector=${encodeURIComponent(sector)}` 
    : "/categories"

  // 2. SUGGESTION LOGIC (Same as Categories Page)
  useEffect(() => {
    async function fetchSuggestions() {
      if (localSearch.length < 2) {
        setSuggestions([])
        return
      }
      
      const { data } = await supabase
        .from('profession_taxonomy')
        .select('profession')
        .ilike('profession', `%${localSearch}%`)
        .limit(5)

      if (data) {
        const unique = Array.from(new Set(data.map(d => d.profession)))
        setSuggestions(unique)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [localSearch])

  // 3. CLICK OUTSIDE TO CLOSE DROPDOWN
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 4. MAIN SEARCH FETCH LOGIC
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      
      const term = categoryKey || searchQuery || ""
      const cleanTerm = term.trim()
      
      // Singularize (Doctors -> Doctor)
      let singularTerm = cleanTerm
      if (cleanTerm.toLowerCase().endsWith('s')) {
         singularTerm = cleanTerm.slice(0, -1)
      }

      console.log(`Searching for: "${cleanTerm}" and "${singularTerm}"`)

      let query = supabase
        .from('profiles')
        .select('id, username, full_name, profession, avatar_url, city, bio')
        .in('role', ['professional', 'provider'])

      if (cleanTerm) {
        const orClause = `profession.ilike.%${cleanTerm}%,profession.ilike.%${singularTerm}%`
        query = query.or(orClause)
      }
      
      if (searchQuery) {
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

  // Handle manual search form submit
  const handleManualSearch = () => {
    if (localSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearch)}`)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="container mx-auto px-4">
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <button 
                 onClick={() => router.back()} 
                 className="text-slate-500 hover:text-teal-700 text-sm flex items-center gap-1 mb-4 w-fit transition-colors"
               >
                  <ArrowLeft className="w-4 h-4" /> Back
               </button>

               <h1 className="text-3xl font-bold text-slate-900 capitalize">
                 {categoryName} <span className="text-teal-600">({profiles.length})</span>
               </h1>
               <p className="text-slate-500 mt-2">Verified experts ready to help you.</p>
             </div>

             {/* --- SEARCH BAR IN HEADER --- */}
             <div className="w-full md:w-96 relative" ref={wrapperRef}>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                 <Input 
                   value={localSearch}
                   onChange={(e) => {
                     setLocalSearch(e.target.value)
                     setShowSuggestions(true)
                   }}
                   onFocus={() => setShowSuggestions(true)}
                   onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                   placeholder="Search for another expert..."
                   className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                 />
               </div>

               {/* SUGGESTIONS DROPDOWN */}
               {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setLocalSearch(suggestion)
                          setShowSuggestions(false)
                          router.push(`/search?q=${encodeURIComponent(suggestion)}`)
                        }}
                        className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-2 border-b border-slate-50 last:border-0"
                      >
                        <Search className="w-3.5 h-3.5 text-teal-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </div>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  )
}