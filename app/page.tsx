import Link from "next/link"
import { createClient } from "@/utils/supabase/server" 
import { Button } from "@/components/ui/button"
import FadeIn from "@/components/FadeIn" // Ensure filename matches (FadeIn.tsx)
import { 
  ShieldCheck, Star, TrendingUp,
  Code, Stethoscope, Laptop, Home, 
  Briefcase, Gavel, PenTool, GraduationCap, Truck, Music, PawPrint,
  LayoutDashboard ,Fingerprint, CheckCircle2, RefreshCw, UserCheck,
  Award, 
} from "lucide-react"
import type { Metadata } from "next"

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
export const metadata: Metadata = {
  title: "TruVouch – Build Trust with Real Reviews",
  description:
    "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
  alternates: {
    canonical: "https://www.truvouch.app",
  },
  openGraph: {
    title: "TruVouch – Build Trust with Real Reviews",
    description:
      "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
    url: "https://www.truvouch.app",
    siteName: "TruVouch",
    type: "website",
  },
}

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
        <section className="relative px-4 sm:px-6 lg:px-40 pt-28 pb-12 lg:pt-32 lg:pb-10 overflow-hidden">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
              
              {/* LEFT COLUMN: Main Content Fades In */}
              <FadeIn className="space-y-6 max-w-2xl relative z-10 mx-auto lg:mx-0 text-center lg:text-left">
  {/* - Mobile: text-3xl (was 4xl)
      - Tablet: sm:text-4xl (was 5xl)
      - Desktop: clamp min reduced to 2.5rem and max to 3.5rem 
  */}
  <h1 className="text-3xl sm:text-4xl lg:text-[clamp(2.5rem,3.5vw,3.5rem)] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
    Build 
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-500"> Credibility.</span><br /> 
    with Verified<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400"> Reviews.</span>
  </h1>

                
                {/* Replaced <motion.p> with standard <p> to fix the crash */}
<p className="text-xl md:text-2xl text-slate-500 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
  Verify your excellence. Build a reputation that inspires absolute confidence <span className="text-slate-900 font-bold">with every single client.</span>
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

                {/* BUTTONS SECTION */}
<div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
  
  {/* PRIMARY BUTTON */}
  {isProfessional ? (
    <Link href="/service-provider-dashboard" className="w-full sm:w-auto">
      <Button 
        className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-900 text-white 
        h-auto !py-5 !px-10 
        rounded-2xl font-bold text-lg hover:bg-teal-950 transition-all shadow-xl shadow-teal-900/10 active:scale-95"
      >
        <LayoutDashboard className="w-5 h-5" />
        Go to Dashboard
      </Button>
    </Link>
  ) : (
    <Link href="/auth/signup?role=professional" className="w-full sm:w-auto">
      <Button 
        className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-900 text-white 
        h-auto py-5! px-10! 
        rounded-2xl font-bold text-lg hover:bg-teal-950 transition-all shadow-xl shadow-teal-900/10 active:scale-95"
      >
        List My Business
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5 group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </Button>
    </Link>
  )}

  {/* SECONDARY BUTTON */}
  <Link href="/categories" className="w-full sm:w-auto">
    <Button 
      variant="ghost" 
      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-800 
      h-auto py-5! px-10!
      rounded-2xl font-bold text-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
    >
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
                  width={380} 
                  height={380}
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
                <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">Browse Excellence</h2>
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

        <section id="features" className="py-12 md:py-24 px-4 sm:px-6 bg-[#FAFBFC] overflow-hidden">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

    {/* LEFT VISUAL GRID 
        - Mobile: Tighter gap, smaller images
        - Desktop: Full size, large stagger effect
    */}
    <div className="grid grid-cols-2 gap-3 sm:gap-4 order-2 lg:order-1">
      {/* Column 1 (Staggered down) */}
      <div className="space-y-3 sm:space-y-4 pt-8 sm:pt-12">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-40 sm:h-64 relative group">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
            alt="trust"
            className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-teal-900/20" />
        </div>

        <div className="bg-teal-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white h-32 sm:h-48 flex flex-col justify-end">
          <h4 className="text-xl sm:text-2xl font-bold">100%</h4>
          <p className="text-teal-200 text-xs sm:text-sm">Human Verified</p>
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm h-32 sm:h-48 flex flex-col justify-end">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl mb-3 sm:mb-4 flex items-center justify-center text-teal-800">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">Anti-Spam</h4>
        </div>

        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-40 sm:h-64 relative group">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400"
            alt="team"
            className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-amber-900/20" />
        </div>
      </div>
    </div>

    {/* RIGHT CONTENT 
        - Mobile: Order 1 (appears first), smaller text
        - Desktop: Order 2 (appears right)
    */}
    <div className="order-1 lg:order-2 text-center lg:text-left">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900 mb-8 sm:mb-12">
        Trust shouldn’t be a <br className="hidden lg:block" /> gamble.
      </h2>

      <div className="space-y-8 sm:space-y-10 text-left">

        {/* ITEM 1 */}
        <div className="flex gap-4 sm:gap-6">
  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center text-teal-800">
    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
  </div>
  <div>
    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
      Unshakeable Credibility
    </h4>
    <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
      Stand out from the noise. Build a dedicated <span className="text-slate-700 font-semibold">Trust Portfolio</span> that proves your excellence to clients instantly.
    </p>
  </div>
</div>

        {/* ITEM 2 */}
        <div className="flex gap-4 sm:gap-6">
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center text-teal-800">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
              One Review Protocol
            </h4>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              Each client can leave only one verified review per professional — no manipulation.
            </p>
          </div>
        </div>

        {/* ITEM 3 */}
        <div className="flex gap-4 sm:gap-6">
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center text-teal-800">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
              Merit-Based Ranking
            </h4>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              Rankings are driven by quality and satisfaction — not paid promotions.
            </p>
          </div>
        </div>

      </div>
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