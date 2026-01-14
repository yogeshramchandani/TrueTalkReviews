"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRight, Star, ShieldCheck } from "lucide-react"
// 👇 1. Import the Google Button
import GoogleAuthButton from "@/app/auth/google-button"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      alert(error.message)
      return
    }

    const nextUrl = searchParams.get("next")
    if (nextUrl) {
      router.push(nextUrl)
      return
    }

    const user = data.user
    const role = user?.user_metadata?.role

    if (role === 'professional') {
      router.push("/service-provider-dashboard")
    } else {
      router.push("/explore") 
    }
  }

  return (
    <div className="fixed inset-0 z-[50] w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* 1. LEFT SIDE - THE FORM */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-6">
               <div className="flex items-center gap-2 justify-center lg:justify-start">
                 <div className="bg-teal-900 text-white p-2 rounded-lg font-bold text-xl">TV</div>
                 <span className="text-teal-900 text-2xl font-bold tracking-tight">TruVouch</span>
               </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please sign in to access your dashboard.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            
            {/* 👇 2. Google Button Added Here */}
            <div>
               <GoogleAuthButton />
               <div className="relative flex items-center justify-center mt-6">
                  <span className="absolute w-full h-px bg-slate-200"></span>
                  <span className="relative bg-white px-3 text-xs text-slate-400 uppercase font-bold">Or continue with email</span>
               </div>
            </div>

            {/* Email Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-teal-500 focus:border-teal-500 w-full"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <Link href="/auth/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 focus:ring-teal-500 focus:border-teal-500 w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-sm transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Sign in"}
              </Button>
            </form>

          </div>

          {/* Footer Link */}
          <div className="text-center">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">New here?</span>
              </div>
            </div>
            
            <Link href="/auth/signup" className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1">
               Create an account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* 2. RIGHT SIDE - DECORATIVE (PC Only) */}
      <div className="hidden lg:flex relative bg-slate-900 h-full overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
            alt="Office workspace"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-slate-900/50" />
        </div>

        <div className="relative z-10 text-white mt-auto">
          <div className="flex gap-1 mb-6">
             {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />)}
          </div>
          <blockquote className="text-3xl font-medium leading-tight mb-8">
            "Since joining TruVouch, my freelance business has grown by 300%. The verified reviews give clients total confidence."
          </blockquote>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg border border-white/30">
               JS
             </div>
             <div>
               <p className="font-bold text-lg">James Smith</p>
               <p className="text-teal-200">Senior React Developer</p>
             </div>
          </div>
        </div>

        <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-700">
           <ShieldCheck className="w-8 h-8 text-teal-400" />
           <div>
             <p className="text-white font-bold text-sm">100% Verified</p>
             <p className="text-teal-200 text-xs">Real reviews only</p>
           </div>
        </div>
      </div>
    </div>
  )
}