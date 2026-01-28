"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Mail, CheckCircle2, ShieldCheck, Star } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // IMPORTANT: Ensure this URL matches your actual localhost port
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setIsLoading(false)
      alert(error.message) 
    } else {
      setIsLoading(false)
      setIsSubmitted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[50] w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* 1. LEFT SIDE - THE FORM */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header */}
          {!isSubmitted ? (
            <div className="text-center lg:text-left">
              <Link href="/" className="inline-block mb-6">
                 <div className="flex items-center gap-2 justify-center lg:justify-start">
                   <div className="bg-teal-900 text-white p-2 rounded-lg font-bold text-xl">TR</div>
                   <span className="text-teal-900 text-2xl font-bold tracking-tight">TruVouch</span>
                 </div>
              </Link>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Check your email</h2>
              <p className="mt-4 text-slate-500">
                We have sent a password reset link to <br/>
                <span className="font-bold text-slate-900">{email}</span>
              </p>
            </div>
          )}

          {/* Form */}
          {!isSubmitted ? (
            <form className="mt-8 space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-teal-500 focus:border-teal-500 w-full"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-sm transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
               <Button 
                variant="outline" 
                onClick={() => setIsSubmitted(false)}
                className="w-full h-11"
              >
                Try another email
              </Button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="font-medium text-teal-700 hover:text-teal-600 flex items-center justify-center gap-2 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Log in
            </Link>
          </div>

        </div>
      </div>

      {/* 2. RIGHT SIDE - DECORATIVE (Same as Login) */}
      <div className="hidden lg:flex relative bg-slate-900 h-full overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0">
         <div className="relative h-full w-full">
  <Image
    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
    alt="Office workspace"
    fill
    priority
    className="object-cover opacity-40 mix-blend-overlay"
  />
</div>

          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-slate-900/50" />
        </div>

        <div className="relative z-10 text-white mt-auto">
          <div className="flex gap-1 mb-6">
             {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />)}
          </div>
          <blockquote className="text-3xl font-medium leading-tight mb-8">
            "Security is our top priority. We ensure your account and data are always protected."
          </blockquote>
        </div>

        <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-700">
           <ShieldCheck className="w-8 h-8 text-teal-400" />
           <div>
             <p className="text-white font-bold text-sm">Secure Recovery</p>
             <p className="text-teal-200 text-xs">Encrypted link</p>
           </div>
        </div>
      </div>
    </div>
  )
}