"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { usePathname } from "next/navigation"
import Image from 'next/image';
// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem 
} from "@/components/ui/dropdown-menu"

// Icons - Added ShieldCheck to match your requested Logo UI
import { Menu, X, Search, LayoutDashboard, LogOut, User, PlusCircle, ShieldCheck } from "lucide-react"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [initials, setInitials] = useState("U")
  const pathname = usePathname()

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLFormElement>(null)

  // Helper function to calculate initials
  const calculateInitials = (name: string) => {
    if (!name) return "U"
    const nameParts = name.trim().split(' ')
    return nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
      : name.substring(0, 2).toUpperCase()
  }

  // 1. Fetch User Data
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Try to fetch Professional Profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (data) {
          // CASE A: It is a Professional
          setProfile(data)
          if (data.full_name) {
             setInitials(calculateInitials(data.full_name))
          }
        } else {
          // CASE B: It is a Reviewer (No profile row)
          const metaName = session.user.user_metadata?.full_name
          if (metaName) {
            setInitials(calculateInitials(metaName))
          }
        }
      }
    }
    getUser()
  }, [])

  // 2. SEARCH SUGGESTIONS LOGIC
  useEffect(() => {
    async function fetchSuggestions() {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      const { data } = await supabase
        .from('profession_taxonomy')
        .select('profession')
        .ilike('profession', `%${searchQuery}%`)
        .limit(5)

      if (data) {
        const unique = Array.from(new Set(data.map(d => d.profession)))
        setSuggestions(unique)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 3. Close Dropdown on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // Determine Display Name logic
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User"
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      setShowSuggestions(false)
    }
  }

  const dashboardLink = '/service-provider-dashboard'

  return (
    // Outer Wrapper: Fixed + Spacing for the floating effect
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 pointer-events-none">
      
      {/* Inner Container: Glassmorphism + Rounded Corners */}
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-sm border border-slate-200/50 pointer-events-auto">
        
        {/* LOGO (Styled as requested) */}
        <Link href="/" className="flex items-center gap-2">
  <Image 
    src="/logo.png" 
    alt="TruVouch Logo" 
    width={36}          // Equivalent to h-9 (9 * 4px)
    height={36}         // Set a base height to prevent Layout Shift
    priority            // Tells Next.js to load this immediately (LCP optimization)
    className="object-contain w-auto h-9" 
  />
          <span className="font-bold text-teal-900 text-xl tracking-tight sm:block">
            TruVouch
          </span>
        </Link>

        {/* DESKTOP SEARCH (Preserved Functionality) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8 relative">
           <form ref={wrapperRef} onSubmit={handleSearch} className="relative w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <Input 
               placeholder="Search services..." 
               className="pl-10 bg-slate-100/50 border-transparent focus:bg-white focus:border-teal-200 transition-all rounded-xl h-10 text-sm"
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value)
                 setShowSuggestions(true)
               }}
               onFocus={() => setShowSuggestions(true)}
             />

             {/* --- SUGGESTIONS DROPDOWN --- */}
             {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
                      }}
                      className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-teal-500" />
                      {suggestion}
                    </div>
                  ))}
                </div>
             )}
           </form>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-6">
            <Link href="/about" className={`text-sm font-semibold hover:text-teal-700 transition-colors ${pathname === '/about' ? 'text-teal-700' : 'text-slate-600'}`}>
              About Us
            </Link>

            <Link href="/categories" className={`text-sm font-semibold hover:text-teal-700 transition-colors ${pathname === '/categories' ? 'text-teal-700' : 'text-slate-600'}`}>
              Categories
            </Link>

            {profile?.role == 'reviewer' && (
              <Link href="/auth/signup?role=professional">
                <Button variant="ghost" className="text-teal-800 hover:bg-teal-50 font-bold text-sm h-9 px-4 rounded-xl">
                  For Business
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none ml-2">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 hover:border-teal-200 transition-all cursor-pointer">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-teal-900 text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-4 mr-2 rounded-xl shadow-xl border-slate-100" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                        {profile?.role === 'professional' ? 'Professional Account' : 'Reviewer Account'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* PROFESSIONAL MENU */}
                  {profile?.role === 'professional' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={dashboardLink} className="cursor-pointer w-full flex items-center font-medium">
                          <LayoutDashboard className="mr-2 h-4 w-4 text-teal-600" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {profile?.username && (
                        <DropdownMenuItem asChild>
                          <Link href={`/u/${profile.username}`} className="cursor-pointer w-full flex items-center">
                            <User className="mr-2 h-4 w-4" /> Public Profile
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {/* REVIEWER MENU */}
                  {profile?.role !== 'professional' && (
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signup?role=professional" className="cursor-pointer w-full flex items-center text-orange-600 font-medium bg-orange-50 rounded-md my-1">
                        <PlusCircle className="mr-2 h-4 w-4" /> List your Business
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer w-full flex items-center focus:text-red-700 focus:bg-red-50 rounded-md">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-bold text-slate-700 hover:text-teal-800 transition-colors">
                  Log In
                </Link>
                <Link href="/auth/signup">
                   <Button className="bg-teal-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-800 hover:shadow-lg hover:shadow-teal-900/20 transition-all active:scale-95">
                     Sign Up Free
                   </Button>
                </Link>
              </div>
            )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open Main Menu">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 pointer-events-auto">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input type="text" placeholder="Search..." className="pl-10 bg-slate-50 border-slate-200 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>

          <div className="flex flex-col gap-1">
              <Link href="/categories" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Browse Categories</Link>
              <Link href="/about" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">About Us</Link>
              
              {profile?.role !== 'professional' && (
                <Link href="/auth/signup?role=professional" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">For Business</Link>
              )}
          </div>
          
          <div className="border-t border-slate-100 pt-4">
            {user ? (
               <div className="space-y-3">
                 <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-teal-900 text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{displayName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                 </div>

                 {profile?.role === 'professional' && (
                   <Link href={dashboardLink}>
                      <Button variant="outline" className="w-full justify-start mt-2 rounded-xl">
                         <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                      </Button>
                   </Link>
                 )}

                 {profile?.role !== 'professional' && (
                   <Link href="/auth/signup?role=professional">
                      <Button variant="outline" className="w-full justify-start mt-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl">
                         <PlusCircle className="mr-2 h-4 w-4" /> List your Business
                      </Button>
                   </Link>
                 )}

                 <Button variant="ghost" className="w-full justify-start text-red-600 rounded-xl hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                 </Button>
               </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/login"><Button variant="outline" className="w-full rounded-xl">Log in</Button></Link>
                <Link href="/auth/signup"><Button className="w-full bg-teal-900 hover:bg-teal-800 rounded-xl">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}