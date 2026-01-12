"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, Settings, LogOut, 
  Search, Bell, User, MapPin, Briefcase, X
} from "lucide-react"

// --- TYPES ---
type SearchResult = {
  id: string
  full_name: string
  avatar_url: string | null
  type: 'user' | 'location' | 'profession'
  detail: string
}

type Notification = {
  id: string
  title: string
  message: string
  time: Date
  type: 'user' | 'review'
}

// ✅ FIX: Moved NavItem OUTSIDE the main component
// Pass 'currentPath' as a prop so it knows when to highlight
const NavItem = ({ href, icon: Icon, label, currentPath }: { href: string, icon: any, label: string, currentPath: string }) => {
  const isActive = currentPath === href
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${
        isActive 
          ? 'bg-teal-600 text-white shadow-md shadow-teal-200' 
          : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // 1. AUTH CHECK
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

  // 2. REAL-TIME NOTIFICATIONS
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          addNotification({
            id: payload.new.id,
            title: 'New User Signup',
            message: `${payload.new.full_name || 'Someone'} just joined.`,
            type: 'user',
            time: new Date()
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        (payload) => {
          addNotification({
            id: payload.new.id,
            title: 'New Review Posted',
            message: `A new ${payload.new.rating}-star review was added.`,
            type: 'review',
            time: new Date()
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev])
    setHasNew(true)
  }

  // 3. ULTIMATE SEARCH LOGIC
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, city, profession, avatar_url')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,profession.ilike.%${searchQuery}%`)
        .limit(5)

      if (data) {
        const formatted: SearchResult[] = data.map((item: any) => {
          let type: 'user' | 'location' | 'profession' = 'user'
          let detail = `@${item.username}`

          if (item.city?.toLowerCase().includes(searchQuery.toLowerCase())) {
            type = 'location'
            detail = item.city
          } else if (item.profession?.toLowerCase().includes(searchQuery.toLowerCase())) {
            type = 'profession'
            detail = item.profession
          }

          return {
            id: item.id,
            full_name: item.full_name,
            avatar_url: item.avatar_url,
            type,
            detail
          }
        })
        setSearchResults(formatted)
      }
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]) 
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false) 
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  if (isLoading) return null

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
            {/* ✅ FIX: Passing pathname as a prop */}
            <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" currentPath={pathname} />
            <NavItem href="/admin/users" icon={Users} label="Users & Accounts" currentPath={pathname} />
            <NavItem href="/admin/listing" icon={ShoppingBag} label="Listings" currentPath={pathname} />
            <NavItem href="/admin/reviews" icon={MessageSquare} label="Reviews" currentPath={pathname} />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">System</p>
              <NavItem href="/admin/settings" icon={Settings} label="Settings" currentPath={pathname} />
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
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 bg-[#F4F7FE] shrink-0">
           <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Pages / Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
           </div>

           <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm relative">
              
              {/* SEARCH BAR */}
              <div className="relative hidden sm:block" ref={searchRef}>
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <input 
                   placeholder="Search (e.g. 'Jaipur' or 'John')" 
                   className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm border-none focus:ring-2 focus:ring-teal-500 w-64 text-slate-600 placeholder:text-slate-400 transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 
                 {(searchResults.length > 0 || isSearching) && (
                   <div className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      {isSearching && <div className="p-3 text-xs text-slate-400 text-center">Searching database...</div>}
                      
                      {searchResults.map((result) => (
                        <div 
                          key={result.id} 
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                          onClick={() => {
                            setSearchQuery("") 
                            setSearchResults([])
                            router.push(`/admin/users?highlight=${result.id}`)
                          }}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                             result.type === 'location' ? 'bg-orange-100 text-orange-600' :
                             result.type === 'profession' ? 'bg-purple-100 text-purple-600' :
                             'bg-teal-100 text-teal-600'
                           }`}>
                              {result.type === 'location' && <MapPin className="w-4 h-4" />}
                              {result.type === 'profession' && <Briefcase className="w-4 h-4" />}
                              {result.type === 'user' && <User className="w-4 h-4" />}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-slate-800 truncate">{result.full_name}</p>
                             <p className="text-xs text-slate-500 truncate">
                               {result.type === 'location' && `Located in ${result.detail}`}
                               {result.type === 'profession' && `Works as ${result.detail}`}
                               {result.type === 'user' && result.detail}
                             </p>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              {/* NOTIFICATIONS */}
              <div className="relative" ref={notifRef}>
                <button 
                  className="p-2 text-slate-400 hover:text-teal-600 transition-colors relative"
                  onClick={() => { setShowNotifs(!showNotifs); setHasNew(false); }}
                >
                  <Bell className="w-5 h-5" />
                  {hasNew && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>

                {showNotifs && (
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                     <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-xs font-bold text-slate-500 uppercase">Live Updates</span>
                        <button onClick={() => setNotifications([])} className="text-xs text-teal-600 hover:underline">Clear</button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-8 text-center text-slate-400 text-sm">No new updates</div>
                        ) : (
                           notifications.map((notif, i) => (
                             <div key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50 flex gap-3">
                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'user' ? 'bg-teal-500' : 'bg-orange-500'}`}></div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                   <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                   <p className="text-[10px] text-slate-300 mt-1">{notif.time.toLocaleTimeString()}</p>
                                </div>
                             </div>
                           ))
                        )}
                     </div>
                  </div>
                )}
              </div>

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