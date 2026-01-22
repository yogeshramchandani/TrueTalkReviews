"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { 
  ShieldCheck, Star, TrendingUp, Loader2,
  Code, Stethoscope, Laptop, Home, 
  Briefcase, Gavel, PenTool, GraduationCap, Truck, Music, PawPrint
} from "lucide-react"

// Import our new modular components
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
// Add this near your other useState hooks
  
// SECTOR ICON MAP
const sectorIcons: Record<string, any> = {
  "Technology": Code,
  "Freelancers & Tech": Laptop,
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

// Background Colors Map
const bgColors = [
  { text: "text-blue-600", bg: "bg-blue-50" },
  { text: "text-red-500", bg: "bg-red-50" },
  { text: "text-slate-700", bg: "bg-slate-100" },
  { text: "text-orange-600", bg: "bg-orange-50" },
  { text: "text-indigo-600", bg: "bg-indigo-50" },
  { text: "text-teal-600", bg: "bg-teal-50" },
  { text: "text-green-600", bg: "bg-green-50" },
  { text: "text-purple-600", bg: "bg-purple-50" },
]

export default function LandingPage() {
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
// Inside LandingPage component
  const [activeId, setActiveId] = useState(0)
const [isProfessional, setIsProfessional] = useState(false)
  const featuredCategories = [
    { 
      id: 0,
      title: "Home Services", 
      desc: "Cleaning, Moving & Repairs", 
      img: "https://cdn.pixabay.com/photo/2025/06/16/12/52/cleaning-services-9663247_1280.jpg",
    },
    { 
      id: 1,
      title: "Technology", 
      desc: "Development & IT Support", 
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
    },
    { 
      id: 2,
      title: "Professional Services", 
      desc: "Design, Photo & Music", 
      img: "https://cdn.pixabay.com/photo/2017/05/04/16/37/meeting-2284501_1280.jpg",
    },
    { 
      id: 3,
      title: "Health & Fitness", 
      desc: "Trainers & Nutritionists", 
      img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
    },
  ]


  useEffect(() => {
    // 2. NEW FUNCTION: Check User Status from 'profiles' table
    async function checkUserStatus() {
      // A. Check if a user session exists
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // B. If user exists, query the 'profiles' table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id) // Assuming 'id' in profiles matches auth.uid()
          .single()
        
        // C. Only switch to Dashboard if the role is explicitly 'professional'
        // If role is 'reviewer' or if there is an error, it stays false (List My Business)
        if (!error && data && data.role === 'professional') {
          setIsProfessional(true)
        }
      }
    }
    
    checkUserStatus()

    async function fetchSectors() {
      try {
        const { data, error } = await supabase
          .from('profession_taxonomy')
          .select('sector')
        
        if (error) throw error

        if (data) {
          const uniqueSectors = Array.from(new Set(data.map(item => item.sector))).sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            return a.localeCompare(b);
          })
          
          const formattedSectors = uniqueSectors.map((sectorName, index) => {
            const colorTheme = bgColors[index % bgColors.length]
            return {
              name: sectorName,
              icon: sectorIcons[sectorName] || sectorIcons.default,
              color: colorTheme.text,
              bg: colorTheme.bg
            }
          })
          
          setSectors(formattedSectors)
        }
      } catch (err) {
        console.error("Error fetching sectors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSectors()
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col ">
      
      {/* 1. GLOBAL NAVBAR */}
      <Navbar />
      
      <main className="flex-1">
        
        {/* 2. HERO SECTION */}
<section className="relative px-4 sm:px-6 lg:px-20 pt-6 pb-12 lg:pt-12 lg:pb-10 overflow-hidden">
      {/* Container centered with mx-auto, no extra side margins */}
      <div className="container mx-auto">
        
        {/* Grid aligned to top (items-start) so art doesn't drop down */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Text Content */}
          <div className="space-y-6 max-w-2xl relative z-10 mx-auto lg:mx-0 text-center lg:text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-[clamp(3rem,5.5vw,4.5rem)] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Unleash Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-500">Reputation</span> with
              Verified Reviews
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-[clamp(1.1rem,1.5vw,1.25rem)] text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Elevate your professional trust to new heights. Join the platform designed to inspire confidence, verify excellence, and empower your career journey.
            </p>

            {/* Stats Row */}
            <div className="flex justify-center lg:justify-start items-center gap-8 sm:gap-12 pt-4">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold text-slate-900">500+</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Active Pros</p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-slate-200"></div>
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold text-slate-900">10k+</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Reviews</p>
              </div>
            </div>

            {/* 3. UPDATED BUTTONS LOGIC */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  
                  {/* CONDITIONAL RENDERING FOR PROFESSIONAL BUTTON */}
                  {isProfessional ? (
                    // IF LOGGED IN AS PROFESSIONAL -> SHOW DASHBOARD
                    <Link href="/service-provider-dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 px-8 text-lg bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-none w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    // IF NOT LOGGED IN (OR REGULAR USER) -> SHOW LIST MY BUSINESS
                    <Link href="/auth/signup?role=professional" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 px-8 text-lg bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-none w-full">
                        List My Business
                      </Button>
                    </Link>
                  )}

                  <Link href="/categories" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-14 px-8 text-lg border-2 border-slate-900 text-slate-900 hover:bg-slate-800 hover:text-white font-bold rounded-none w-full transition-all duration-300"
                    >
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </div>
              

          {/* RIGHT COLUMN: CSS Geometric Art */}
          {/* UPDATED SIZE: 
              - scale(clamp(1.15, ...)) -> Starts at 115% size (Very Big)
              - Max size 1.6 (160%)
          */}
<div className="w-fit mx-auto relative hidden lg:flex items-start justify-center origin-top transform lg:scale-[1.15] xl:scale-[1.2] 2xl:scale-[1.3]">  
  {/* Reference the file path directly from the public root */}
  <img 
    src="/art.svg" 
    alt="Geometric Pattern" 
    width={420} 
    height={400}
    className="block" 
  />

</div>

        </div>
      </div>
    </section>


        {/* 3. SECTORS SECTION */}
        <section className="py-12 bg-white border-b border-slate-100">
          {/* Safe Margins */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">What are you looking for?</h2>
            
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal-600" /></div>
            ) : sectors.length === 0 ? (
               <div className="text-center text-slate-400 py-10">No sectors found.</div>
            ) : (
              // Scrollbar hide utility for clean mobile scrolling
              <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {sectors.map((cat, i) => (
                  <Link 
                    href={`/categories?sector=${encodeURIComponent(cat.name)}`} 
                    key={i} 
                    className="group min-w-[140px] md:min-w-[160px] shrink-0"
                  >
                    <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer h-full">
                      <div className={`w-12 h-12 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-teal-700 text-center line-clamp-1 text-sm md:text-base">{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. VALUE PROPOSITION */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why users trust <span className="text-teal-700">TruVouch</span></h2>
              <p className="text-slate-500 text-lg">We've built a platform where honesty is the only currency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature Cards */}
              <div className="p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Identity Verification</h3>
                <p className="text-slate-600 leading-relaxed">
                  We verify every professional's identity so you know exactly who you are hiring. No bots, no fakes.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">The "One Review" Rule</h3>
                <p className="text-slate-600 leading-relaxed">
                  A user can only review a professional once. This prevents spam and ensures every rating is genuine.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Community Driven</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our rankings are purely based on community feedback, not on who pays the most for ads.
                </p>
              </div>
            </div>
          </div>
        </section>

       {/* 5. POPULAR THIS WEEK (Interactive Split Layout) */}
        {/* 5. POPULAR THIS WEEK (Elastic Accordion) */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Trending Now</h2>
              <p className="text-slate-500 mt-2">Tap to explore the most booked services.</p>
            </div>

            {/* THE ELASTIC GRID */}
            {/* Flex-col on mobile (vertical), Flex-row on desktop (horizontal) */}
            <div className="flex flex-col md:flex-row gap-4 h-[600px] md:h-[500px] w-full max-w-7xl mx-auto">
              
              {featuredCategories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)} // Click/Tap to expand
                  onMouseEnter={() => setActiveId(cat.id)} // Hover to expand (Desktop)
                  className={`
                    relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out shadow-md
                    ${activeId === cat.id 
                      ? "flex-3 md:flex-3" // Grow big when active
                      : "flex-1 md:flex-1" // Shrink when inactive
                    }
                  `}
                >
                  {/* Background Image */}
                  <Image 
                    src={cat.img} 
                    alt={cat.title}
                    fill
                    priority={cat.id === 0}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={`object-cover transition-transform duration-700 ${activeId === cat.id ? "scale-100" : "scale-125 opacity-80"}`}
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className={`absolute inset-0 bg-black/30 transition-colors duration-500 ${activeId === cat.id ? "bg-black/20" : "bg-black/60"}`} />

                  {/* Content Position */}
                  {/* We rotate text on desktop when inactive to save space */}
                  <div className={`
                    absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end h-full
                    ${activeId !== cat.id ? "items-center md:items-start" : "items-start"}
                  `}>
                    
                    {/* The Badge (Only visible when active) */}
                    <div className={`
                      mb-auto ml-auto bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
                      transition-all duration-500 delay-100
                      ${activeId === cat.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 hidden md:block"}
                    `}>
                      Popular
                    </div>

                    {/* Title & Desc */}
                    <div className={`transition-all duration-500 ${activeId !== cat.id && "md:-rotate-90 md:mb-25 md:whitespace-nowrap"}`}>
                      <h3 className={`font-bold text-white leading-tight ${activeId === cat.id ? "text-2xl md:text-3xl mb-9" : "text-xl md:text-2xl"}`}>
                        {cat.title}
                      </h3>
                      
                      <div className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${activeId === cat.id ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"}
                      `}>
                        <p className="text-slate-100 text-sm md:text-base font-medium">
                          {cat.desc}
                        </p>
                        <Link href={`/categories?sector=${encodeURIComponent(cat.title)}`}>
                          <Button size="sm" className="mt-4 bg-white text-slate-900 hover:bg-teal-50 border-none font-bold">
                            View Pros
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      {/* 6. GLOBAL FOOTER */}
      <Footer />
    </div>
  )
}