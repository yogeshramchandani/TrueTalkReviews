"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { 
  Briefcase, ChevronRight, Search, Loader2, Code, Stethoscope, Home, 
  GraduationCap, Truck, Music, PawPrint, Gavel, PenTool, UserCircle, Layers
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// 1. SECTOR ICON MAP
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // 1. Get ALL Professionals (The Source of Truth)
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('profession')
          // FILTER: Only fetch profiles that actually have a profession set
          .not('profession', 'is', null) 
          // OPTIONAL: Filter by role if you use it (comment out if unsure)
           .eq('role', 'professional')

        if (profError) throw profError

        // 2. Get the Taxonomy (The Dictionary)
        // We use this just to know which "Sector" a profession belongs to.
        const { data: taxonomy, error: taxError } = await supabase
          .from('profession_taxonomy')
          .select('sector, profession')

        if (taxError) throw taxError

        // --- PROCESSING LOGIC ---

        // A. Create a Lookup Map for Taxonomy: "Software Developer" -> "Technology"
        const professionToSectorMap: Record<string, string> = {}
        taxonomy?.forEach((item: any) => {
          professionToSectorMap[item.profession.toLowerCase().trim()] = item.sector
        })

        // B. Group Profiles by Sector
        const groupedData: Record<string, any> = {}

        profiles?.forEach((p) => {
          if (!p.profession) return

          const originalName = p.profession.trim()
          const lowerName = originalName.toLowerCase()

          // Find which sector this belongs to. 
          // If not found in taxonomy, put it in "Other / Uncategorized"
          const sectorName = professionToSectorMap[lowerName] || "Uncategorized"

          // Initialize Sector Bucket if missing
          if (!groupedData[sectorName]) {
            groupedData[sectorName] = {
              id: sectorName,
              name: sectorName,
              icon: sectorIcons[sectorName] || sectorIcons.default,
              professionsMap: {} // Nested map to count unique professions
            }
          }

          // Count the profession inside this sector
          // We use a map to handle duplicate profile counts: 
          // groupedData["Health"].professionsMap["Doctor"] = 5
          const profMap = groupedData[sectorName].professionsMap
          
          if (!profMap[originalName]) {
            profMap[originalName] = {
              name: originalName,
              count: 0
            }
          }
          profMap[originalName].count += 1
        })

        // C. Convert Object Map to Array for Rendering
        // We sort sectors alphabetically, but put "Uncategorized" last.
        const finalCategories = Object.values(groupedData).map((sector: any) => ({
          ...sector,
          subCategories: Object.values(sector.professionsMap) // Flatten the professions map
        })).sort((a: any, b: any) => {
          if (a.name === "Uncategorized") return 1
          if (b.name === "Uncategorized") return -1
          return a.name.localeCompare(b.name)
        })

        setCategories(finalCategories)
        if (finalCategories.length > 0) setActiveCategory(finalCategories[0])

      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = () => {
     if(searchTerm) window.location.href = `/search?q=${searchTerm}`
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-700"/></div>

  // EMPTY STATE
  if (categories.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white p-4 text-center">
         <Layers className="w-16 h-16 text-slate-200 mb-4" />
         <h2 className="text-2xl font-bold text-slate-900">No Professionals Yet</h2>
         <p className="text-slate-500 mt-2 max-w-md">
           We checked the database, but no professional profiles were found.
         </p>
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
          
          <div className="max-w-xl mx-auto flex gap-2">
            <Input 
              className="h-12 bg-white border-slate-300" 
              placeholder="Search services..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button className="h-12 bg-teal-700 hover:bg-teal-800" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
         {/* SIDEBAR */}
         <aside className="w-full lg:w-72 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Sectors</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
               {categories.map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => setActiveCategory(cat)}
                   className={`
                     w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 transition-all
                     ${activeCategory?.id === cat.id 
                       ? "bg-teal-600 text-white shadow-md shadow-teal-900/20" 
                       : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                     }
                   `}
                 >
                   <cat.icon className={`w-5 h-5 ${activeCategory?.id === cat.id ? "text-teal-200" : "text-slate-400"}`}/> 
                   <span className="flex-1">{cat.name}</span>
                   <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory?.id === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                     {cat.subCategories.length}
                   </span>
                 </button>
               ))}
            </div>
         </aside>

         {/* MAIN CONTENT */}
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
                      href={`/search?category=${sub.name}`} 
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
                
                {activeCategory.subCategories.filter((s:any) => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400">No specific professions found matching "{searchTerm}" in this sector.</p>
                  </div>
                )}
              </div>
            )}
         </main>
      </div>
    </div>
  )
}