"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { 
  Car, Stethoscope, Briefcase, Home, Smartphone, 
  ShoppingBag, PawPrint, Gavel, ChevronRight, Search, 
  Zap, Code, PenTool, Dumbbell, Loader2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// 1. STATIC STRUCTURE (Defines Icons & Groups)
// The 'keyword' must match what you save in the DB 'profession' column
const rawCategories = [
  {
    id: "freelancers",
    name: "Freelancers & Tech",
    icon: Code,
    subCategories: [
      { name: "Software Developer", keyword: "software-developer", icon: Code },
      { name: "Graphic Designer", keyword: "graphic-designer", icon: PenTool },
      { name: "UI/UX Designer", keyword: "ui-ux-designer", icon: Smartphone },
      { name: "Digital Marketer", keyword: "digital-marketer", icon: Zap },
      { name: "SEO Specialist", keyword: "seo-specialist", icon: Search },
      { name: "Content Writer", keyword: "content-writer", icon: PenTool },
      { name: "Video Editor", keyword: "video-editor", icon: Smartphone },
    ]
  },
  {
    id: "health",
    name: "Health & Medical",
    icon: Stethoscope,
    subCategories: [
      { name: "Doctor", keyword: "doctor", icon: Stethoscope },
      { name: "Dentist", keyword: "dentist", icon: Stethoscope },
      { name: "Therapist", keyword: "therapist", icon: Stethoscope },
      { name: "Personal Trainer", keyword: "personal-trainer", icon: Dumbbell },
      { name: "Yoga Instructor", keyword: "yoga-instructor", icon: Dumbbell },
      { name: "Life Coach", keyword: "life-coach", icon: Briefcase },
    ]
  },
  {
    id: "services",
    name: "Home Services",
    icon: Home,
    subCategories: [
      { name: "Plumber", keyword: "plumber", icon: Home },
      { name: "Electrician", keyword: "electrician", icon: Zap },
      { name: "Carpenter", keyword: "carpenter", icon: Home },
      { name: "Interior Designer", keyword: "interior-designer", icon: Home },
    ]
  },
  {
    id: "professional",
    name: "Professional Services",
    icon: Briefcase,
    subCategories: [
      { name: "Lawyer", keyword: "lawyer", icon: Gavel },
      { name: "Real Estate Agent", keyword: "real-estate-agent", icon: Home },
      { name: "Architect", keyword: "architect", icon: Home },
      { name: "Consultant", keyword: "consultant", icon: Briefcase },
      { name: "Accountant", keyword: "accountant", icon: ShoppingBag },
    ]
  },
  {
    id: "other",
    name: "Other",
    icon: PawPrint,
    subCategories: [
      { name: "Astrologer", keyword: "astrologer", icon: Stethoscope },
      { name: "Tarot Reader", keyword: "tarot-reader", icon: Stethoscope },
      { name: "Event Planner", keyword: "event-planner", icon: ShoppingBag },
      { name: "Photographer", keyword: "photographer", icon: CameraIcon },
    ]
  }
]

// Helper icon for mapping fallback
function CameraIcon(props: any) { return <Smartphone {...props} /> }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchStats() {
      // 1. Fetch ALL professional profiles to count them
      // In a large app, you would use a .rpc() function for this to be faster
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('profession')
        .eq('role', 'professional')

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // 2. Count Occurrences: { 'dentist': 5, 'plumber': 2 }
      const counts: Record<string, number> = {}
      profiles?.forEach((p) => {
        const key = p.profession || 'unknown'
        counts[key] = (counts[key] || 0) + 1
      })

      // 3. Filter the Static List
      const filteredData = rawCategories.map(cat => {
        // Filter subcategories that have at least 1 professional
        const validSubs = cat.subCategories.map(sub => ({
          ...sub,
          count: counts[sub.keyword] || 0
        })).filter(sub => sub.count > 0) // <--- Only show if count > 0

        return { ...cat, subCategories: validSubs }
      }).filter(cat => cat.subCategories.length > 0) // <--- Only show Main Category if it has subcategories

      setCategories(filteredData)
      if (filteredData.length > 0) {
        setActiveCategory(filteredData[0])
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const handleSearch = () => {
     if(searchTerm) {
         window.location.href = `/search?q=${searchTerm}`
     }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    )
  }

  // EMPTY STATE: If no professionals exist in DB yet
  if (categories.length === 0) {
     return (
        <div className="flex flex-col h-screen items-center justify-center bg-white p-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No Professionals Found</h2>
            <p className="text-slate-500 mt-2">Be the first to join as a professional!</p>
            <Link href="/auth/signup?role=professional">
                <Button className="mt-4 bg-teal-700">Register Business</Button>
            </Link>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">What are you looking for?</h1>
          <p className="text-slate-500 mb-8">Compare the best companies and professionals in any industry.</p>
          
          <div className="max-w-xl mx-auto relative flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                className="pl-10 h-12 rounded-lg text-base bg-white border-slate-300 shadow-sm focus-visible:ring-teal-600"
                placeholder="Search for 'Dentist' or 'Plumber'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <Button className="h-12 px-6 bg-teal-700 hover:bg-teal-800" onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 2. SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <h3 className="font-bold text-slate-900 mb-4 px-2 hidden lg:block">Categories</h3>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${activeCategory?.id === cat.id 
                      ? "bg-teal-50 text-teal-800 border-teal-200 border" 
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent"
                    }
                  `}
                >
                  <cat.icon className={`w-5 h-5 ${activeCategory?.id === cat.id ? "text-teal-700" : "text-slate-400"}`} />
                  {cat.name}
                  {activeCategory?.id === cat.id && (
                    <ChevronRight className="w-4 h-4 ml-auto hidden lg:block text-teal-700" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* 3. MAIN CONTENT */}
          <main className="flex-1 min-h-[500px]">
            {activeCategory && (
                <>
                <div className="mb-6 flex items-center gap-2">
                <span className="text-slate-400 text-sm">Categories</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-900">{activeCategory.name}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeCategory.subCategories.map((sub: any, index: number) => (
                    // LINK TO THE SEARCH PAGE WITH QUERY PARAM
                    <Link 
                    href={`/search?category=${sub.keyword}&name=${sub.name}`} 
                    key={index}
                    className="group block p-5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all bg-white"
                    >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <sub.icon className="w-6 h-6 text-slate-500 group-hover:text-teal-700" />
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-700 mb-1">
                        {sub.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        {sub.count} verified experts
                    </p>
                    </Link>
                ))}
                </div>
                </>
            )}
          </main>

        </div>
      </div>
    </div>
  )
}