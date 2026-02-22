"use client"

import Link from "next/link"
import Image from 'next/image';
import { useState } from "react"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    const { error } = await supabase
      .from('newsletter')
      .insert({ email })

    setIsLoading(false)

    if (error) {
      if (error.code === '23505') { // Unique violation code
        toast.success("You are already subscribed!")
      } else {
        console.error(error)
        toast.error("Something went wrong. Please try again.")
      }
    } else {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-[#FAFBFC] pt-24 pb-12 px-6 border-t border-slate-100">
  <div className="max-w-7xl mx-auto">

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

      {/* BRAND */}
      <div className="space-y-6">
       <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="TruVouch Logo" 
            width={36}          
            height={36}         
            priority            
            className="object-contain w-auto h-9" 
          />
          <span className="font-bold text-teal-900 text-xl tracking-tight sm:block">
            TruVouch
          </span>
        </Link>

        <p className="text-slate-500 font-medium leading-relaxed">
          Setting the global standard for professional trust and verified excellence since 2026.
        </p>

        <div className="flex gap-4">
          {[ 
            { Icon: Twitter, link: "https://x.com/TruetalkR54738" },
            { Icon: Linkedin, link: "https://www.linkedin.com/company/truvouch" },
            { Icon: Instagram, link: "https://www.instagram.com/truvouch" }
          ].map(({ Icon, link }, i) => (
            <Link
              key={i}
              href={link}
              className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-teal-900 hover:text-white transition-all"
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>

      {/* EXPLORE */}
      <div>
        <h5 className="font-bold text-slate-900 mb-6">Explore</h5>
        <ul className="space-y-4 text-slate-500 font-medium text-sm">
          <li><Link href="/categories" className="hover:text-teal-700">Categories</Link></li>
          <li><Link href="/search" className="hover:text-teal-700">Search Professionals</Link></li>
          <li><Link href="/auth/signup?role=professional" className="hover:text-teal-700">For Businesses</Link></li>
        </ul>
      </div>

      {/* COMPANY */}
      <div>
        <h5 className="font-bold text-slate-900 mb-6">Company</h5>
        <ul className="space-y-4 text-slate-500 font-medium text-sm">
          <li><Link href="/about" className="hover:text-teal-700">About Us</Link></li>
          <li><Link href="/safety-guidelines" className="hover:text-teal-700">Safety Guidelines</Link></li>
          <li><Link href="/community-guidelines" className="hover:text-teal-700">Privacy Policy</Link></li>
        </ul>
      </div>

      {/* NEWSLETTER */}
      <div>
        <h5 className="font-bold text-slate-900 mb-6">Newsletter</h5>
        <p className="text-slate-500 text-sm mb-4">
          Get curated trust reports and industry news.
        </p>

        {isSubscribed ? (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-2 text-teal-700 text-sm font-medium">
            <Check className="w-4 h-4" /> Subscribed successfully!
          </div>
        ) : (
          <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none outline-none px-3 w-full text-sm"
            />
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-teal-900 text-white p-2.5 rounded-lg hover:bg-teal-950 transition"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

    </div>

    {/* BOTTOM BAR */}
    <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
        © 2026 TruVouch Elite. All Rights Reserved.
      </p>

      <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link href="/help-center" className="hover:text-slate-900">Support</Link>
        <Link href="/safety-guidelines" className="hover:text-slate-900">Guidelines</Link>
        <Link href="/contact" className="hover:text-slate-900">Contact Us</Link>
      </div>
    </div>

  </div>
</footer>
  )
}