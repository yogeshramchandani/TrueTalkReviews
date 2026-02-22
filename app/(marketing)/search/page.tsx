"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ShieldCheck, Loader2, ArrowLeft, Frown, Search } from "lucide-react"

// --- 1. GLOBAL CACHE (Lives outside the component) ---
// This persists as long as the tab is open (or until a hard refresh).
const searchCache = new Map<string, any[]>();

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get query params
  const categoryKey = searchParams.get("category")
  const sector = searchParams.get("sector")
  const categoryName = searchParams.get("name") || categoryKey || "Professionals"
  const searchQuery = searchParams.get("q") 
const getOptimizedUrl = (url: string | null) => {
  if (!url) return undefined
  // Remove the cache buster (?v=...) and use Supabase transformation
  // We request a 100x100px WebP image with 60% quality.
  return `${url}?width=100&height=100&resize=cover&quality=60&format=webp`
}
  // Generate a unique key for this specific search
  const cacheKey = `${categoryKey || ''}-${searchQuery || ''}-${sector || ''}`

  // --- LOCAL STATE ---
  const [localSearch, setLocalSearch] = useState(searchQuery || categoryKey || "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // --- 2. INSTANT STATE INITIALIZATION ---
  // We initialize state from the cache. If it exists, 'loading' starts as false.
  // This prevents the "white flash" and allows scroll restoration to work.
  const [profiles, setProfiles] = useState<any[]>(() => {
      return searchCache.get(cacheKey) || []
  })
  
  const [loading, setLoading] = useState(() => {
      return !searchCache.has(cacheKey)
  })

  // Suggestion Logic (Unchanged)
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
        // @ts-ignore
        const unique = Array.from(new Set(data.map(d => d.profession)))
        // @ts-ignore
        setSuggestions(unique)
      }
    }
    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [localSearch])

  // Click Outside Logic (Unchanged)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- 3. OPTIMIZED DATA FETCHING ---
  useEffect(() => {
    // If we changed search params, check if the NEW params are already cached
    if (searchCache.has(cacheKey)) {
        setProfiles(searchCache.get(cacheKey)!)
        setLoading(false)
        return // STOP HERE - No need to fetch
    }

    const fetchProfiles = async () => {
      setLoading(true)
      
      const term = categoryKey || searchQuery || ""
      const cleanTerm = term.trim()
      let singularTerm = cleanTerm
      if (cleanTerm.toLowerCase().endsWith('s')) {
         singularTerm = cleanTerm.slice(0, -1)
      }

      console.log(`Fetching from DB: "${cleanTerm}"`)

      let query = supabase
        .from('profiles')
        .select('id, username, full_name, profession, avatar_url, city, bio')
        .in('role', ['professional', 'provider'])
        .limit(50)

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
        setLoading(false)
      } else {
        const results = data || []
        // --- 4. SAVE TO CACHE ---
        searchCache.set(cacheKey, results)
        setProfiles(results)
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [cacheKey, categoryKey, searchQuery]) // Depend on cacheKey

  const handleManualSearch = () => {
    if (localSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearch)}`)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pb-8 shadow-sm pt-24">
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

             {/* Search Bar */}
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
      {/* Results Grid */}
      <div className="container mx-auto px-4 md:px-14 py-4 md:py-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
             <p className="text-slate-400">Finding the best experts...</p>
           </div>
        ) : profiles.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 mx-4">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Frown className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-700 mb-2">No professionals found.</h3>
             <p className="text-slate-500 max-w-md mx-auto mb-6 px-4">
               We couldn't find any experts matching <strong>"{categoryKey || searchQuery}"</strong>.
             </p>
             <Link href="/categories">
                <Button variant="outline">Browse all Categories</Button>
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all hover:border-teal-200 bg-white duration-300">
                {/* 🎯 Shrinked Padding: p-3 for mobile, p-6 for desktop */}
                <div className="p-3 md:p-6">
                  {/* Top Section */}
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* 🎯 Shrinked Avatar: 12x12 for mobile, 16x16 for desktop */}
                    <div className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                      <Avatar className="h-full w-full border-2 border-slate-100 group-hover:border-teal-100 transition-colors shadow-sm">
                        {profile.avatar_url ? (
                          <Image 
                            src={profile.avatar_url} 
                            alt={profile.full_name}
                            fill 
                            sizes="(max-width: 768px) 48px, 64px"
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-teal-50 text-teal-800 font-bold text-base md:text-xl">
                            {profile.full_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          {/* 🎯 Shrinked Font: text-base for mobile, text-lg for desktop */}
                          <h3 className="font-bold text-base md:text-lg text-slate-900 truncate pr-1 group-hover:text-teal-700 transition-colors">
                            {profile.full_name}
                          </h3>
                          <div className="bg-green-50 text-green-700 p-0.5 md:p-1 rounded-full shrink-0" title="Verified">
                            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </div>
                      </div>
                      <p className="text-teal-600 text-[10px] md:text-xs font-bold mb-0.5 md:mb-1 uppercase tracking-wide">
                        {profile.profession || "Professional"}
                      </p>
                      {profile.city && (
                        <div className="flex items-center text-[10px] md:text-xs text-slate-400">
                          <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" /> {profile.city}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio: Hidden on very small screens or kept tightly clamped */}
                  <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-50">
                    <p className="text-slate-500 text-xs md:text-sm line-clamp-2 h-8 md:h-10 leading-relaxed">
                      {profile.bio || "No bio available."}
                    </p>
                  </div>

                  {/* Action Button Section */}
                  <div className="mt-3 md:mt-6 flex items-center justify-between gap-2 md:gap-3">
                    <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-orange-100">
                        <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-orange-400 text-orange-400" />
                        <span className="font-bold text-slate-700 text-[10px] md:text-xs">5.0</span>
                    </div>
                    
                    <Link href={`/u/${profile.username}`} className="flex-1">
                      {/* 🎯 Shrinked Button Height: h-8 for mobile, default for desktop */}
                      <Button className="w-full h-8 md:h-10 text-xs md:text-sm bg-slate-900 text-white hover:bg-teal-700 shadow-md group-hover:shadow-lg transition-all">
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
    <Suspense fallback={<div className="flex justify-center pt-24 py-20"><Loader2 className="animate-spin text-teal-700" /></div>}>
      <SearchResults />
    </Suspense>
  )
}