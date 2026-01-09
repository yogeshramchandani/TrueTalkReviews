"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ShieldCheck, Star, TrendingUp, 
  Gavel, Stethoscope, Hammer, Laptop, Dumbbell, Home, Store, UserCircle
} from "lucide-react"

// Import our new modular components
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroButtons } from "@/components/hero-buttons"

export default function LandingPage() {

  // CATEGORIES DATA
  const categories = [
    { name: "Freelancers", icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Doctors", icon: Stethoscope, color: "text-red-500", bg: "bg-red-50" },
    { name: "Lawyers", icon: Gavel, color: "text-slate-700", bg: "bg-slate-100" },
    { name: "Contractors", icon: Hammer, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Tech Experts", icon: Laptop, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Gym & Fit", icon: Dumbbell, color: "text-teal-600", bg: "bg-teal-50" },
    { name: "Real Estate", icon: Home, color: "text-green-600", bg: "bg-green-50" },
    { name: "Small Biz", icon: Store, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* 1. GLOBAL NAVBAR */}
      <Navbar />
      
      <main className="flex-1">
        
        {/* 2. HERO SECTION */}
        <div className="relative bg-slate-50 pt-20 pb-28 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 md:w-96 md:h-96 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs md:text-sm font-medium mb-8 shadow-sm animate-fade-in-up">
              <span className="flex gap-1">
                {[1,2,3].map(i => <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-orange-500 fill-orange-500" />)}
              </span>
              <span>100% Verified Professionals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Real Experiences. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-500">True Talk.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
              Find trusted professionals based on honest feedback. 
              No fake ratings, just transparent reviews from the community.
            </p>

            {/* ACTION BUTTONS (Dynamic based on login) */}
            <HeroButtons />
            
          </div>
        </div>

        {/* 3. "What are you looking for?" SECTION */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">What are you looking for?</h2>
            
            {/* Scrollable Container */}
            <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat, i) => (
                <Link href={`/search?q=${cat.name}`} key={i} className="group min-w-[140px] md:min-w-[160px] flex-shrink-0">
                  <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-teal-700 text-center">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. VALUE PROPOSITION */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why users trust <span className="text-teal-700">TrueTalk</span></h2>
              <p className="text-slate-500 text-lg">We've built a platform where honesty is the only currency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Identity Verification</h3>
                <p className="text-slate-600 leading-relaxed">
                  We verify every professional's identity so you know exactly who you are hiring. No bots, no fakes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">The "One Review" Rule</h3>
                <p className="text-slate-600 leading-relaxed">
                  A user can only review a professional once. This prevents spam and ensures every rating is genuine.
                </p>
              </div>

              {/* Feature 3 */}
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

        {/* 5. POPULAR THIS WEEK */}
        {/* 5. POPULAR THIS WEEK */}
        {/* CHANGED: bg-slate-900 -> bg-slate-50 (Light Background) */}
        <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-center md:items-end mb-12 max-w-6xl mx-auto gap-6 text-center md:text-left">
              <div>
                {/* CHANGED: text-white -> text-slate-900 */}
                <h2 className="text-3xl font-bold text-slate-900">Popular this Week</h2>
                {/* CHANGED: text-slate-400 -> text-slate-500 */}
                <p className="text-slate-500 mt-2">Browse top-rated professionals in your city.</p>
              </div>
              <Link href="/categories" className="w-full md:w-auto">
                <Button className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-lg shadow-orange-500/20 w-full md:w-auto transition-transform hover:scale-105">
                  View all Categories
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Home Services", img: "https://cdn.pixabay.com/photo/2025/06/16/12/52/cleaning-services-9663247_1280.jpg" },
                { title: "Tech Experts", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80" },
                { title: "Creative", img: "https://cdn.pixabay.com/photo/2023/08/20/17/00/crochet-8202792_1280.jpg" },
                { title: "Health & Fitness", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80" },
              ].map((cat, i) => (
                // CHANGED: Added shadow-md and hover:shadow-xl to make cards pop on light bg
                <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-teal-900/40 transition-colors z-10" />
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                    <h3 className="text-white font-bold text-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{cat.title}</h3>
                    <div className="h-1 w-12 bg-orange-500 mt-3 group-hover:w-full transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
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