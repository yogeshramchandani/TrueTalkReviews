import { ShieldCheck, Users, Star, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

// 👇 1. SEO METADATA (Crucial for Google)
export const metadata: Metadata = {
  title: "About Us | TruVouch",
  description: "TruVouch is the verified trust layer for the internet. We help Astrologers, Consultants, and Professionals showcase real, verified client reviews.",
  openGraph: {
    title: "About Us - Building Trust for Professionals",
    description: "No more fake screenshots. TruVouch provides a dedicated dashboard for verified reviews.",
    type: "website",
  }
}

export default function AboutPage() {
  return (
    // 👇 2. SEMANTIC 'MAIN' TAG
    <main className="min-h-screen bg-white font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 py-24 px-4 overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-300 text-sm font-bold mb-6">
            Our Mission
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Building the internet's <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">Verified Trust Layer.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TruVouch is the dedicated platform for professionals to showcase real, verified reviews and for clients to find services they can actually trust.
          </p>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
               {/* Decorative "Messy" Screenshots feeling */}
               <div className="absolute -right-10 top-10 w-48 h-64 bg-white shadow-xl rounded-xl transform rotate-6 border border-slate-200"></div>
               <div className="absolute -right-4 top-24 w-48 h-64 bg-white shadow-xl rounded-xl transform -rotate-3 border border-slate-200 z-10 p-4 flex flex-col gap-2">
                 <div className="w-full h-2 bg-slate-100 rounded"></div>
                 <div className="w-3/4 h-2 bg-slate-100 rounded"></div>
               </div>
               
               <div className="relative z-20 mt-32">
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">The Old Way</h3>
                 <p className="text-slate-600">Scattered screenshots, unverified DMs, and fake reviews make it impossible to know who to trust.</p>
               </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Why we built TruVouch</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                We noticed a huge gap in the service industry—especially for freelancers, consultants, and niche experts (like Astrologers, Coaches, and Tutors). 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Great professionals were relying on messy WhatsApp screenshots to prove their worth, while clients were scared of getting scammed. We wanted to build a bridge of <b>Verified Trust</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Trust is our currency</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6 text-teal-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Verified</h3>
              <p className="text-slate-600">We use advanced logic to verify users. No bots, no fake spam. Every review comes from a real human.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 text-orange-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community First</h3>
              <p className="text-slate-600">We are building for the community. Whether you are an Astrologer or a Developer, your reputation matters here.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-700">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Data Privacy</h3>
              <p className="text-slate-600">Your data is yours. We don't sell it. We just provide the platform to showcase your excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-teal-900 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to build your reputation?</h2>
            <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of professionals who are switching from screenshots to a professional Verification Dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup?role=professional">
                <Button size="lg" className="bg-white text-teal-900 hover:bg-teal-50 font-bold h-14 px-8 text-lg border-0">
                  List My Business
                </Button>
              </Link>
              
              <Link href="/categories">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-2 border-teal-500 text-white hover:bg-teal-800 hover:border-teal-800 hover:text-white h-14 px-8 text-lg"
                >
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}