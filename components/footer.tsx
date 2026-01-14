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
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="TruVouch Logo" className="h-8 w-auto object-contain brightness-0 invert" />
              <span className="font-bold text-white text-xl tracking-tight">TruVouch</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting you with the most trusted professionals in your area. Real reviews, real people.
            </p>
           
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/categories" className="hover:text-teal-400 transition-colors">Browse Categories</Link></li>
              <li><Link href="/search" className="hover:text-teal-400 transition-colors">Find Professionals</Link></li>
              <li><Link href="/auth/signup?role=professional" className="hover:text-teal-400 transition-colors">For Businesses</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help-center" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link href="/safety-guidelines" className="hover:text-teal-400 transition-colors">Safety Guidelines</Link></li>
              <li><Link href="/community-guidelines" className="hover:text-teal-400 transition-colors">Community Guidelines</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Logic */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-xs text-slate-500 mb-4">Get the latest updates and offers.</p>
            
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
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center min-w-[44px]"
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