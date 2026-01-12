"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, Settings, LogOut, Search, Bell 
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
         router.push("/") 
      } else {
         setIsLoading(false)
      }
    }
    checkAdmin()
  }, [router])

  if (isLoading) return null

  // THEME UPDATE: Swapped Emerald for Teal
  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${
          isActive 
            ? 'bg-teal-600 text-white shadow-md shadow-teal-200' // <--- CHANGED TO TEAL
            : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {label}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-[#F4F7FE]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white hidden md:flex flex-col fixed h-full z-10 p-4 shadow-sm border-r border-slate-100">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
            <div className="h-8 w-8 bg-teal-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">TrueTalk<span className="text-teal-600">.</span></span>
        </div>

        <nav className="flex-1 space-y-1">
            <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/admin/users" icon={Users} label="Users & Accounts" />
            <NavItem href="/admin/listing" icon={ShoppingBag} label="Listings" />
            <NavItem href="/admin/reviews" icon={MessageSquare} label="Reviews" />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">System</p>
              <NavItem href="/admin/settings" icon={Settings} label="Settings" />
            </div>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-50">
            <button 
                onClick={() => { supabase.auth.signOut(); router.push("/") }}
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 w-full text-sm font-medium transition-colors"
            >
                <LogOut className="w-5 h-5" /> Logout
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-[#F4F7FE] shrink-0">
           <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Pages / Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
           </div>

           <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm">
              <div className="relative hidden sm:block">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <input 
                   placeholder="Search..." 
                   className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm border-none focus:ring-0 w-48 text-slate-600 placeholder:text-slate-400"
                 />
              </div>
              <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold border-2 border-white shadow-sm">
                A
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 pt-2">
           {children}
        </main>
      </div>
    </div>
  )
}