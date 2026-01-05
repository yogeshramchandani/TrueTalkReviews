"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Loader2, LayoutDashboard } from "lucide-react"

export function HeroButtons() {
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(data?.role || null)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) {
    return <div className="flex gap-4 mt-8 justify-center h-14 items-center"><Loader2 className="animate-spin text-teal-700" /></div>
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full">
      
      {/* 1. FIND AN EXPERT (Always Visible) */}
      <Link href="/search" className="w-full sm:w-auto">
        <Button size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg font-bold shadow-lg shadow-orange-500/20 w-full transition-transform hover:scale-105">
          Find an Expert
        </Button>
      </Link>

      {/* 2. DYNAMIC BUTTON (Get Listed OR Dashboard) */}
      {role === 'professional' ? (
        <Link href="/service-provider-dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="h-14 px-8 bg-teal-700 hover:bg-teal-800 text-white border-2 border-teal-600 rounded-full text-lg font-bold w-full transition-transform hover:scale-105 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/auth/signup?role=professional" className="w-full sm:w-auto">
          {/* UPDATED STYLE FOR LIGHT BACKGROUND */}
          <Button 
  size="lg" 
  variant="outline" 
  className="h-14 px-8 border-teal-200 text-teal-900 hover:bg-teal-50 hover:text-teal-900 rounded-full text-lg font-bold w-full transition-all"
>
  Get Listed
</Button>
        </Link>
      )}
    </div>
  )
}