"use client"

import Link from "next/link"
import { useState } from "react"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    const { error } = await supabase
      .from('newsletter')
      .insert({ email })

    setIsLoading(false)

    if (error) {
      if (error.code === '23505') { // Unique violation code
        alert("You are already subscribed!")
      } else {
        console.error(error)
        alert("Something went wrong. Please try again.")
      }
    } else {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <img src="/full_logo_bg.png" alt="TruVouch Logo" className="h-12 w-35 object-cover rounded-2xl" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting you with the most trusted professionals in your area. Real reviews, real people.
            </p>
            <div className="flex gap-4">
           {/* Twitter / X */}
      <Link 
        href="https://x.com/TruetalkR54738" 
        className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-900 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
      >
        <Twitter className="w-5 h-5" />
      </Link>

      {/* LinkedIn */}
      <Link 
        href="https://www.linkedin.com/company/truvouch" 
        className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-900 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
      >
        <Linkedin className="w-5 h-5" />
      </Link>

      {/* Instagram */}
      <Link 
        href="https://www.instagram.com/truvouch" 
        className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-900 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
      >
        <Instagram className="w-5 h-5" />
      </Link>
      </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/categories" className="hover:text-teal-400 transition-colors">Categories</Link></li>
              <li><Link href="/search" className="hover:text-teal-400 transition-colors">Search pro</Link></li>
              <li><Link href="/auth/signup?role=professional" className="hover:text-teal-400 transition-colors">For Businesses</Link></li>
            </ul>
            
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/help-center" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link href="/safety-guidelines" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/community-guidelines" className="hover:text-teal-400 transition-colors">Community Guidelines</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Logic */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-xs text-slate-400 mb-4">Get the latest updates and offers.</p>
            
            {isSubscribed ? (
               <div className="bg-teal-900/50 border border-teal-800 rounded-lg p-3 flex items-center gap-2 text-teal-400 text-sm">
                 <Check className="w-4 h-4" /> Thanks for subscribing!
               </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-none text-white text-sm rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-slate-600"
                />
                <button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center min-w-[44px]" aria-label="Subscribe to Newsletter"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 TruVouch. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/safety-guidelines" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/community-guidelines" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}