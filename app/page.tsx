import Link from "next/link"
import { createClient } from "@/utils/supabase/server" 
import { Button } from "@/components/ui/button"
import FadeIn from "@/components/FadeIn" // Ensure filename matches (FadeIn.tsx)
import { 
  ShieldCheck, Star, TrendingUp,
  Code, Stethoscope, Laptop, Home, 
  Briefcase, Gavel, PenTool, GraduationCap, Truck, Music, PawPrint,
  LayoutDashboard 
} from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TrendingSection } from "@/components/trending-section"

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

export default async function LandingPage() {
  const supabase = createClient()

  // 1. Fetch User & Role (Server Side - Parallel Fetching)
  const { data: { user } } = await supabase.auth.getUser()
  
  let isProfessional = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (data && data.role === 'professional') {
      isProfessional = true
    }
  }

  // 2. Fetch Sectors (Server Side)
  const { data: sectorsData } = await supabase
    .from('profession_taxonomy')
    .select('sector')

  // Process sectors immediately on the server
  let formattedSectors: any[] = []
  if (sectorsData) {
    const uniqueSectors = Array.from(new Set(sectorsData.map(item => item.sector))).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    })
    
    formattedSectors = uniqueSectors.map((sectorName, index) => {
      const colorTheme = bgColors[index % bgColors.length]
      return {
        name: sectorName,
        icon: sectorIcons[sectorName] || sectorIcons.default,
        color: colorTheme.text,
        bg: colorTheme.bg
      }
    })
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col ">
      
      {/* Navbar gets the user object immediately */}
      <Navbar />
      
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-20 pt-6 pb-12 lg:pt-12 lg:pb-10 overflow-hidden">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              
              {/* LEFT COLUMN: Main Content Fades In */}
              <FadeIn className="space-y-6 max-w-2xl relative z-10 mx-auto lg:mx-0 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-[clamp(3rem,5.5vw,4.5rem)] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                  Unleash Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-500">Reputation</span> with
                  Verified Reviews
                </h1>
                
                <p className="text-lg sm:text-xl lg:text-[clamp(1.1rem,1.5vw,1.25rem)] text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Elevate your professional trust to new heights. Join the platform designed to inspire confidence, verify excellence, and empower your career journey.
                </p>

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

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  {isProfessional ? (
                    <Link href="/service-provider-dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 px-8 text-lg bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-none w-full gap-2">
                         <LayoutDashboard className="w-5 h-5" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup?role=professional" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 px-8 text-lg bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-none w-full">
                        List My Business
                      </Button>
                    </Link>
                  )}

                  <Link href="/categories" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-slate-900 text-slate-900 hover:bg-slate-800 hover:text-white font-bold rounded-none w-full transition-all duration-300">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              {/* RIGHT COLUMN: Image Fades In slightly later */}
              <FadeIn delay={0.2} className="w-fit mx-auto relative hidden lg:flex items-start justify-center origin-top transform lg:scale-[1.15] xl:scale-[1.2] 2xl:scale-[1.3]">  
                <img 
                  src="/art.svg" 
                  alt="Geometric Pattern" 
                  width={420} 
                  height={400}
                  className="block" 
                />
              </FadeIn>

            </div>
          </div>
        </section>

        {/* SECTORS SECTION */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">What are you looking for?</h2>
            </FadeIn>
            
            {formattedSectors.length === 0 ? (
               <div className="text-center text-slate-400 py-10">No sectors found.</div>
            ) : (
              // Wrap the list in FadeIn
              <FadeIn delay={0.1} className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {formattedSectors.map((cat: any, i: number) => {
                  const Icon = cat.icon
                  return (
                    <Link 
                      href={`/categories?sector=${encodeURIComponent(cat.name)}`} 
                      key={i} 
                      className="group min-w-[140px] md:min-w-[160px] shrink-0"
                    >
                      <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer h-full">
                        <div className={`w-12 h-12 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-teal-700 text-center line-clamp-1 text-sm md:text-base">{cat.name}</span>
                      </div>
                    </Link>
                  )
                })}
              </FadeIn>
            )}
          </div>
        </section>

        {/* VALUE PROPOSITION */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why users trust <span className="text-teal-700">TruVouch</span></h2>
              <p className="text-slate-500 text-lg">We've built a platform where honesty is the only currency.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* STAGGERED ANIMATION FOR CARDS */}
              
              <FadeIn delay={0.1}>
                  <div className="h-full p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6 text-teal-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Identity Verification</h3>
                    <p className="text-slate-600 leading-relaxed">
                      We verify every professional's identity so you know exactly who you are hiring. No bots, no fakes.
                    </p>
                  </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                  <div className="h-full p-8 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">The "One Review" Rule</h3>
                    <p className="text-slate-600 leading-relaxed">
                      A user can only review a professional once. This prevents spam and ensures every rating is genuine.
                    </p>
                  </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                  <div className="h-full p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Community Driven</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Our rankings are purely based on community feedback, not on who pays the most for ads.
                    </p>
                  </div>
              </FadeIn>

            </div>
          </div>
        </section>

        {/* POPULAR THIS WEEK */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Trending Now</h2>
              <p className="text-slate-500 mt-2">Tap to explore the most booked services.</p>
            </FadeIn>
            
            {/* The interactive client component goes here */}
            {/* You can wrap this too if you want the whole section to fade in */}
            <FadeIn delay={0.2}>
                <TrendingSection />
            </FadeIn>
            
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}