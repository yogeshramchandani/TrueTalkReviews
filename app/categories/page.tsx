"use client"

import { useState, useEffect, useRef, Suspense } from "react" // 1. Import Suspense
import Link from "next/link"
import { useSearchParams } from "next/navigation" 
import { supabase } from "@/lib/supabaseClient"
import { 
  Briefcase, ChevronRight, Search, Loader2, Code, Stethoscope, Home, 
  GraduationCap, Truck, Music, PawPrint, Gavel, PenTool, UserCircle, Layers
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// SECTOR ICON MAP
const sectorIcons: Record<string, any> = {
  "Technology": Code,
  "Freelancers & Tech": Code,
  "Health & Medical": Stethoscope,
  "Home Services": Home,
  "Professional Services": Briefcase,
  "Legal & Finance": Gavel,
  "Creative & Arts": PenTool,
  "Education & Training": GraduationCap,
  "Events & Hospitality": Music,
  "Automotive & Transport": Truck,
  "Other": PawPrint,
  "default": Briefcase
}

// 2. RENAME MAIN COMPONENT TO "CategoriesContent"
function CategoriesContent() {
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // --- SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch Suggestions Logic
  useEffect(() => {
    async function fetchSuggestions() {
      if (searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      const { data } = await supabase
        .from('profession_taxonomy')
        .select('profession')
        .ilike('profession', `%${searchTerm}%`)
        .limit(5)

      if (data) {
        const unique = Array.from(new Set(data.map(d => d.profession)))
        setSuggestions(unique)
      }
    }
    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Click Outside to Close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch Main Data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('profession')
          .not('profession', 'is', null) 

        if (profError) throw profError

        const { data: taxonomy, error: taxError } = await supabase
          .from('profession_taxonomy')
          .select('sector, profession')

        if (taxError) throw taxError

        const professionToSectorMap: Record<string, string> = {}
        taxonomy?.forEach((item: any) => {
          professionToSectorMap[item.profession.toLowerCase().trim()] = item.sector
        })

        const groupedData: Record<string, any> = {}

        profiles?.forEach((p) => {
          if (!p.profession) return
          const originalName = p.profession.trim()
          const lowerName = originalName.toLowerCase()
          const sectorName = professionToSectorMap[lowerName] || "Other" 

          if (!groupedData[sectorName]) {
            groupedData[sectorName] = {
              id: sectorName,
              name: sectorName,
              icon: sectorIcons[sectorName] || sectorIcons.default,
              professionsMap: {} 
            }
          }
          const profMap = groupedData[sectorName].professionsMap
          if (!profMap[originalName]) {
            profMap[originalName] = { name: originalName, count: 0 }
          }
          profMap[originalName].count += 1
        })

        const finalCategories = Object.values(groupedData).map((sector: any) => ({
          ...sector,
          subCategories: Object.values(sector.professionsMap)
        })).sort((a: any, b: any) => {
          if (a.name === "Other") return 1
          if (b.name === "Other") return -1
          return a.name.localeCompare(b.name)
        })

        setCategories(finalCategories)

        const urlSector = searchParams.get('sector')
        if (urlSector) {
           const found = finalCategories.find(c => c.name === urlSector)
           if (found) {
             setActiveCategory(found)
           } else if (finalCategories.length > 0) {
             setActiveCategory(finalCategories[0])
           }
        } else {
           if (finalCategories.length > 0) setActiveCategory(finalCategories[0])
        }

      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleSearch = () => {
     if(searchTerm) window.location.href = `/search?q=${searchTerm}`
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-700"/></div>

  if (categories.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white p-4 text-center">
         <Layers className="w-16 h-16 text-slate-200 mb-4" />
         <h2 className="text-2xl font-bold text-slate-900">No Professionals Yet</h2>
         <Link href="/auth/signup?role=professional">
             <Button className="mt-6 bg-teal-700">Be the First to Join</Button>
         </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <div className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h1>
          <p className="text-slate-500 mb-8">Discover top-rated experts across {categories.length} industries.</p>
          
          <div className="max-w-xl mx-auto relative flex gap-2" ref={wrapperRef}>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  className="pl-10 h-12 rounded-lg text-base bg-white border-slate-300 shadow-sm focus-visible:ring-teal-600"
                  placeholder="Search for 'Dentist' or 'Plumber'..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setSearchTerm(suggestion)
                          setShowSuggestions(false)
                          window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
                        }}
                        className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-teal-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <Button className="h-12 px-6 bg-teal-700 hover:bg-teal-800" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
         <aside className="w-full lg:w-72 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Sectors</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
               {categories.map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => {
                     setActiveCategory(cat)
                     window.history.pushState({}, '', `/categories?sector=${encodeURIComponent(cat.name)}`)
                   }}
                   className={`
                     w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 transition-all whitespace-nowrap lg:whitespace-normal
                     ${activeCategory?.id === cat.id 
                       ? "bg-teal-600 text-white shadow-md shadow-teal-900/20" 
                       : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                     }
                   `}
                 >
                   <cat.icon className={`w-5 h-5 flex-shrink-0 ${activeCategory?.id === cat.id ? "text-teal-200" : "text-slate-400"}`}/> 
                   <span className="flex-1">{cat.name}</span>
                   <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory?.id === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                     {cat.subCategories.length}
                   </span>
                 </button>
               ))}
            </div>
         </aside>

         <main className="flex-1 min-h-[60vh]">
            {activeCategory && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-teal-50 rounded-lg">
                     <activeCategory.icon className="w-6 h-6 text-teal-700" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900">{activeCategory.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCategory.subCategories
                    .filter((s:any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((sub: any, i: number) => (
                    <Link 
                      href={`/search?category=${encodeURIComponent(sub.name)}&sector=${encodeURIComponent(activeCategory.name)}`} 
                      key={i} 
                      className="group flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer"
                    >
                       <div className="flex justify-between items-start mb-2">
                         <div className="p-2 rounded-full bg-slate-50 group-hover:bg-teal-50 transition-colors">
                           <UserCircle className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                         </div>
                         <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                           {sub.count} EXPERTS
                         </div>
                       </div>
                       
                       <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-800 mb-1">
                         {sub.name}
                       </h3>
                       <p className="text-sm text-slate-400">View available professionals</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
         </main>
      </div>
    </div>
  )
}

// 3. EXPORT WRAPPED COMPONENT
export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-700" /></div>}>
      <CategoriesContent />
    </Suspense>
  )
}