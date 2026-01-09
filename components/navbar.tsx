"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { usePathname } from "next/navigation"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem 
} from "@/components/ui/dropdown-menu"

// Icons
import { Menu, X, Search, LayoutDashboard, LogOut, User, PlusCircle } from "lucide-react"

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

  // 1. Fetch User Data
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (data) {
          setProfile(data)
          if (data.full_name) {
             const nameParts = data.full_name.split(' ')
             setInitials(nameParts.length > 1 
               ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
               : data.full_name.substring(0, 2).toUpperCase())
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

      // Query the Taxonomy Table
      const { data } = await supabase
        .from('profession_taxonomy')
        .select('profession')
        .ilike('profession', `%${searchQuery}%`)
        .limit(5)

      if (data) {
        // Remove duplicates
        const unique = Array.from(new Set(data.map(d => d.profession)))
        setSuggestions(unique)
      }
    }

    // Debounce to prevent API spam
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      setShowSuggestions(false)
    }
  }

  // Dashboard link only works for professionals
  const dashboardLink = '/service-provider-dashboard'

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">

          <img src="/logo.png" alt="TrueTalkReviews Logo" className="h-10 w-auto object-contain" />

          <span className="font-bold text-teal-900 text-xl tracking-tight sm:block">

            TrueTalk<span className="font-bold text-transparent text-xl bg-clip-text bg-gradient-to-r from-teal-700 to-teal-500"> Reviews</span>

          </span>

        </Link>



        {/* DESKTOP SEARCH WITH SUGGESTIONS */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
           <form 
             ref={wrapperRef} 
             onSubmit={handleSearch} 
             className="relative w-full"
           >
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <Input 
               placeholder="Search for services..." 
               className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-full h-10"
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
                  <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        // Navigate immediately
                        window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
                      }}
                      className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
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
        <div className="hidden lg:flex items-center gap-4">
            <Link href="/categories" className={`text-sm font-medium hover:text-teal-700 transition-colors ${pathname === '/categories' ? 'text-teal-700' : 'text-slate-600'}`}>
              Categories
            </Link>

            {/* "For Business" Button - Visible if NOT a professional */}
            {profile?.role !== 'professional' && (
              <Link href="/auth/signup?role=professional">
                <Button variant="outline" className="text-teal-700 border-teal-100 hover:bg-teal-50 hover:text-teal-900 font-medium text-sm h-9">
                  For Business
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none ml-2">
                  <Avatar className="h-9 w-9 border border-slate-200 hover:ring-2 hover:ring-teal-100 transition-all cursor-pointer">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-teal-900 text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 mr-2" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      {/* Show Role Badge */}
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                        {profile?.role === 'professional' ? 'Professional Account' : 'Reviewer Account'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* --- PROFESSIONAL MENU ITEMS --- */}
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

                  {/* --- REVIEWER MENU ITEMS --- */}
                  {profile?.role !== 'professional' && (
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signup?role=professional" className="cursor-pointer w-full flex items-center text-orange-600 font-medium bg-orange-50">
                        <PlusCircle className="mr-2 h-4 w-4" /> List your Business
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer w-full flex items-center">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/auth/login" className="text-sm font-bold text-slate-700 hover:text-teal-700 px-2">
                  Log in
                </Link>
                <Link href="/auth/signup">
                   <Button className="bg-teal-800 hover:bg-teal-900 text-white rounded-full px-6 shadow-md shadow-teal-900/20">
                     Sign Up
                   </Button>
                </Link>
              </div>
            )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input type="text" placeholder="Search..." className="pl-10 bg-slate-50 border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>

          <div className="flex flex-col gap-1">
              <Link href="/categories" className="block px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">Browse Categories</Link>
              {profile?.role !== 'professional' && (
                <Link href="/auth/signup?role=professional" className="block px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">For Business</Link>
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
                      <p className="font-bold text-sm text-slate-900">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                 </div>

                 {/* Mobile Dashboard Link - Only for Pros */}
                 {profile?.role === 'professional' && (
                   <Link href={dashboardLink}>
                      <Button variant="outline" className="w-full justify-start mt-2">
                         <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                      </Button>
                   </Link>
                 )}

                 {/* Mobile Get Listed Link - Only for Reviewers */}
                 {profile?.role !== 'professional' && (
                   <Link href="/auth/signup?role=professional">
                      <Button variant="outline" className="w-full justify-start mt-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100">
                         <PlusCircle className="mr-2 h-4 w-4" /> List your Business
                      </Button>
                   </Link>
                 )}

                 <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                 </Button>
               </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/login"><Button variant="outline" className="w-full">Log in</Button></Link>
                <Link href="/auth/signup"><Button className="w-full bg-teal-800">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}