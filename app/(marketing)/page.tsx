import Link from "next/link"
import { createClient } from "@/utils/supabase/server" 
import { Button } from "@/components/ui/button"
import Image from "next/image"
import FadeIn from "@/components/FadeIn" // Ensure filename matches (FadeIn.tsx)
import { 
   TrendingUp,
  Code, Stethoscope, Laptop, Home, 
  Briefcase, Gavel, PenTool, GraduationCap, Truck, Music, PawPrint,
  LayoutDashboard , CheckCircle2, RefreshCw, 
  Award, 
} from "lucide-react"
import type { Metadata } from "next"
import { TrendingSection } from "@/components/trending-section"

// SECTOR ICON MAP
const sectorIcons: Record<string, any> = {
  "Technology": Code,
  "Freelancers & Tech": Laptop,
  "Medical": Stethoscope,
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
    canonical: "https://truvouch.app",
  },
  openGraph: {
    title: "TruVouch – Build Trust with Real Reviews",
    description:
      "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
    url: "https://truvouch.app",
    siteName: "TruVouch",
    type: "website",
  },
}

export default async function LandingPage() {
  const supabase = createClient()
  const [userRes, sectorsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profession_taxonomy').select('sector')
  ])
  
const user = userRes.data.user
  const sectorsData = sectorsRes.data
const profile = user
  ? (
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    ).data
  : null

  let isProfessional = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isProfessional = profile?.role === 'professional'
  }

  let formattedSectors: any[] = []
  if (sectorsData) {
    const uniqueSectors = Array.from(new Set(sectorsData.map(item => item.sector))).sort((a: any, b: any) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    })
    
    formattedSectors = uniqueSectors.map((sectorName: any, index: number) => {
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
    
      
      <main className="flex-1">
        
        {/* HERO SECTION */}
<section className="bg-[#FAFBFC] relative px-4 sm:px-6 lg:px-32 pt-28 pb-6 lg:pt-24 lg:pb-6 overflow-hidden">
  <div className="container mx-auto">
<div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-12 items-center">

      {/* LEFT COLUMN */}
      <FadeIn className="space-y-6 max-w-2xl relative z-10 mx-auto lg:mx-0 text-center lg:text-left">

        {/* HEADLINE */}
        <h1 className="text-3xl sm:text-4xl lg:text-[clamp(2.5rem,3.5vw,3.5rem)] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Build{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a5353] to-[#2A6E6E]">
            Credibility.
          </span>
          <br />
          with Verified {" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
            Reviews.
          </span>
        </h1>

        {/* SUBTEXT (LCP SAFE) */}
       <p className="text-xl md:text-2xl text-slate-500 mb-8 font-medium max-w-2xl mx-auto leading-relaxed">
  Verify your excellence. Build a reputation that inspires absolute confidence with every single client through{" "}
  <span className="text-slate-900 font-bold">
      transparency and trust.
  </span>
</p>


        {/* STATS */}
        <div className="flex justify-center lg:justify-start items-center gap-8 sm:gap-12 pt-2">
          <div>
            <h3 className="text-2xl sm:text-3xl lg:text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold text-slate-900">
              500+
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Active Pros
            </p>
          </div>

          <div className="w-px h-10 sm:h-12 bg-slate-200" />

          <div>
            <h3 className="text-2xl sm:text-3xl lg:text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold text-slate-900">
              10k+
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Verified Reviews
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">

          {/* PRIMARY BUTTON */}
          {isProfessional ? (
            <Link href="/service-provider-dashboard" className="w-full sm:w-auto">
              <Button className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-[#1a5353] text-white
                h-auto py-4 px-8
                rounded-2xl font-bold text-lg hover:bg-[#154242] transition-all shadow-xl shadow-[#1a5353]/20 active:scale-95">
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup?role=professional" className="w-full sm:w-auto">
              <Button className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-900 text-white
                h-auto py-4 px-8
                rounded-2xl font-bold text-lg hover:bg-teal-950 transition-all shadow-xl shadow-teal-900/10 active:scale-95">
                List My Business
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          )}

          {/* SECONDARY BUTTON */}
          <Link href="/categories" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-800
                h-auto py-4 px-8
                rounded-2xl font-bold text-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              Explore Services
            </Button>
          </Link>

        </div>
      </FadeIn>

      {/* RIGHT COLUMN (FIXED – NO FAKE SPACE) */}
      <FadeIn
  delay={0.2}
  className="relative hidden lg:flex items-center justify-end
             lg:max-w-[420px] xl:max-w-[460px] 2xl:max-w-[500px]
             justify-self-end -translate-y-4 pt-4 pb-4"
>
  <div className="relative">

    {/* Main Image */}
    <div className="relative z-10 animate-float">
      <img
        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800"
        alt="Professional Networking"
        className="rounded-[2.5rem] shadow-2xl border-8 border-white max-w-[380px]"
      />

      {/* Floating Stat Card */}
      <div className="absolute -bottom-10 -left-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/60 max-w-xs">

        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#FB923C]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="m15.5 12.9 1.5 8.5-3.6-2.7a1 1 0 0 0-1.2 0l-3.6 2.7 1.5-8.5" />
            </svg>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-lg">
              Top Tier Elite
            </h4>
            <p className="text-sm text-slate-500">
              99.8% Trust Score
            </p>
          </div>
        </div>

        <div className="flex -space-x-3">
          <img src="https://i.pravatar.cc/100?u=1" className="w-8 h-8 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/100?u=2" className="w-8 h-8 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/100?u=3" className="w-8 h-8 rounded-full border-2 border-white" />
          <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1a5353]/10 flex items-center justify-center text-[10px] font-bold text-[#1a5353]">
            +12
          </div>
        </div>
      </div>
    </div>

    {/* Backdrop Circle */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[120%] h-[120%] border border-[#1a5353]/20 rounded-full -z-10 opacity-40">
    </div>

  </div>
</FadeIn>


    </div>
  </div>
</section>


        {/* SECTORS SECTION */}
<section className="py-20 bg-white border-b border-slate-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* HEADER ROW */}
    <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">

      <div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Browse Excellence
        </h2>
        <p className="text-slate-500 font-medium text-lg">
          Discover hand-vetted experts across every major sector.
        </p>
      </div>

      <Link
        href="/categories"
        className="flex items-center gap-2 font-bold text-[#1a5353] hover:gap-3 transition-all"
      >
        View All Categories
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>

    </FadeIn>

    {/* GRID */}
    <FadeIn
  delay={0.1}
  className="
    flex lg:grid
    flex-nowrap lg:grid-cols-5 md:grid-cols-3
    gap-4 lg:gap-6
    overflow-x-auto lg:overflow-visible
    pb-4
    scrollbar-hide
  "
>

  {formattedSectors.map((cat: any, i: number) => {
    const Icon = cat.icon

    return (
      <Link
        href={`/categories?sector=${encodeURIComponent(cat.name)}`}
        key={i}
        className="group shrink-0 lg:shrink"
      >
        <div
          className="
            w-[150px] sm:w-[170px] md:w-auto
            p-5 lg:p-8
            rounded-2xl lg:rounded-[2rem]
            bg-slate-50 border border-slate-100
            hover:bg-white hover:border-teal-200
            hover:shadow-xl hover:shadow-teal-900/5
            transition-all duration-500
            cursor-pointer text-center
          "
        >

          <div
            className={`
              w-12 h-12 lg:w-16 lg:h-16
              rounded-xl lg:rounded-2xl
              flex items-center justify-center mx-auto mb-4 lg:mb-6
              ${cat.bg} ${cat.color}
              group-hover:scale-110 group-hover:rotate-6 transition-transform
            `}
          >
            <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>

          <h3 className="font-bold text-slate-800 text-sm lg:text-lg">
            {cat.name}
          </h3>

          <p className="text-[11px] lg:text-xs text-slate-400 mt-1 lg:mt-2 font-medium">
            {cat.count}
          </p>

        </div>
      </Link>
    )
  })}

</FadeIn>


  </div>
</section>


        <section id="features" className="py-12 md:py-24 px-4 sm:px-6 bg-[#FAFBFC] overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 order-2 lg:order-1">
              <div className="space-y-3 sm:space-y-4 pt-8 sm:pt-12">
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-40 sm:h-64 relative group">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                    alt="trust"
                    fill // FIX: Eliminates Layout Shift
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-[#1a5353]/20" />
                </div>
                <div className="bg-[#1a5353] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white h-32 sm:h-48 flex flex-col justify-end">
                  <h4 className="text-xl sm:text-2xl font-bold">100%</h4>
                  <p className="text-teal-100/80 text-xs sm:text-sm">Human Verified</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm h-32 sm:h-48 flex flex-col justify-end">
                  <RefreshCw className="w-6 h-6 text-[#1a5353] mb-4" />
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Anti-Spam</h4>
                </div>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-40 sm:h-64 relative group">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400"
                    alt="team"
                    fill // FIX: Eliminates Layout Shift
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-[#FB923C]/20" />
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
  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center text-[#1a5353]">
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
    </div>
  )
}