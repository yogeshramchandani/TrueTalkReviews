"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
  User,
  PlusCircle,
  Briefcase,
} from "lucide-react";
import { profileEnd } from "console";

export function Navbar({ user, profile }: { user: any; profile: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [initials, setInitials] = useState("U"); // Default start
  const pathname = usePathname();
  const router = useRouter();

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  // Determine Display Name logic immediately
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // 1. FIX: Calculate Initials on Mount/Change
  useEffect(() => {
    if (displayName) {
      const nameParts = displayName.trim().split(" ");
      const calculated =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : displayName.substring(0, 2).toUpperCase();
      setInitials(calculated);
    }
  }, [displayName]);

  // 2. SEARCH SUGGESTIONS LOGIC
  useEffect(() => {
    async function fetchSuggestions() {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from("profession_taxonomy")
        .select("profession")
        .ilike("profession", `%${searchQuery}%`)
        .limit(5);

      if (data) {
        // @ts-ignore
        const unique = Array.from(new Set(data.map((d) => d.profession)));
        // @ts-ignore
        setSuggestions(unique);
      }
    }

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Close Dropdown on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // @ts-ignore
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const isPublicProfilePage = pathname?.startsWith("/u/");
  const dashboardLink = "/service-provider-dashboard";

  return (
    <>
      {isPublicProfilePage ? (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm h-16">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.png"
                alt="TruVouch Logo"
                width={120}
                height={40}
                priority
                className="object-contain h-8 w-auto"
              />
              <span className="sm:block font-bold text-[#1a5353] text-xl tracking-tight">
                TruVouch
              </span>
            </Link>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex relative w-1/3 max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Find professionals..."
                className="pl-9 bg-slate-50 border-slate-200 focus:border-[#1a5353]/30 focus:bg-white rounded-full h-10 w-full transition-all"
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* --- DESKTOP VIEW --- */}
              <div className="hidden md:flex items-center gap-4">
                {/* 🟢 FIXED: Hide if user is the pro owner or already marked as pro */}
                {profile?.role == "reviewer" && (
                  <Link href="/auth/signup?role=professional">
                    <Button
                      variant="ghost"
                      className="text-[#1a5353] hover:bg-[#1a5353] hover:text-white font-bold text-sm h-9 px-3 rounded-full transition-colors"
                    >
                      List Your Business
                    </Button>
                  </Link>
                )}

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="outline-none ml-2 hover:ring-2 hover:ring-[#1a5353]/30 data-[state=open]:ring-2 data-[state=open]:ring-[#1a5353]/40 transition-all rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-slate-100 transition-all">
                          <AvatarImage
                            src={avatarUrl}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-[#1a5353] text-white text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-56 mt-4 mr-2 rounded-xl shadow-xl border-slate-100 bg-white"
                      align="end"
                    >
                      {/* DASHBOARD */}
                      {profile?.role == "professional" && (
                        <DropdownMenuItem className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent">
                          <Link
                            href={dashboardLink}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#1a5353] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {profile?.username && profile?.role == "professional" && (
                        <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                          <Link
                            href={`/u/${profile.username}`}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#334155] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white"
                          >
                            <User className="h-4 w-4" />
                            Public Profile
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-slate-100 my-1" />

                      {/* LIST BUSINESS */}
                      <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                        <button
                          onClick={() =>
                            router.push("/auth/signup?role=professional")
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#FB923C] transition-colors hover:bg-[#FB923C] hover:text-white focus:bg-[#FB923C] focus:text-white"
                        >
                          <PlusCircle className="h-4 w-4" />
                          List your Business
                        </button>
                      </DropdownMenuItem>

                      {/* LOGOUT */}
                      <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#FB923C] transition-colors hover:bg-[#FB923C] hover:text-white focus:bg-[#FB923C] focus:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="text-sm font-bold text-[#334155] hover:text-[#1a5353] transition-colors"
                    >
                      Log In
                    </Link>

                    <Link href="/auth/signup">
                      <Button className="bg-[#1a5353] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#154242] hover:shadow-lg hover:shadow-[#1a5353]/20 transition-all active:scale-95">
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* --- MOBILE VIEW --- */}
              <button
                className="lg:hidden p-2 text-[#334155] hover:bg-slate-100 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open Main Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 px-4 py-3 sm:px-6 sm:py-4 pointer-events-none">
          {/* Inner Container: Glassmorphism + Rounded Corners */}
          <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-sm border border-slate-200/50 pointer-events-auto">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="TruVouch Logo"
                width={36}
                height={36}
                priority
                className="object-contain w-auto h-9"
              />
              <span className="font-bold text-[#1a5353] text-xl tracking-tight sm:block">
                TruVouch
              </span>
            </Link>

            {/* DESKTOP SEARCH */}
            <div className="hidden md:flex flex-1 max-w-sm mx-8 relative">
              <form
                ref={wrapperRef}
                onSubmit={handleSearch}
                className="relative w-full"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 bg-slate-100/50 border-transparent focus:bg-white focus:border-[#1a5353]/30hover:bg-teal-50 transition-all rounded-xl h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
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
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                          router.push(
                            `/search?q=${encodeURIComponent(suggestion)}`,
                          );
                        }}
                        className="px-4 py-2.5 hover:bg-[#1a5353]/5 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-[#1a5353]" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/about"
                className={`text-sm font-semibold hover:text-[#1a5353] transition-colors ${pathname === "/about" ? "text-[#1a5353]" : "text-[#334155]"}`}
              >
                About Us
              </Link>

              <Link
                href="/categories"
                className={`text-sm font-semibold hover:text-[#1a5353] transition-colors ${pathname === "/categories" ? "text-[#1a5353]" : "text-[#334155]"}`}
              >
                Categories
              </Link>

              {profile?.role == "reviewer" && (
                <Link href="/auth/signup?role=professional">
                  <Button
                    variant="ghost"
                    className="text-[#1a5353] hover:bg-[#1a5353]/10 font-bold text-sm h-9 px-4 rounded-xl"
                  >
                    For Business
                  </Button>
                </Link>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none ml-2 hover:ring-2 hover:ring-[#1a5353]/30 data-[state=open]:ring-2 data-[state=open]:ring-[#1a5353]/40 transition-all rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-slate-100 transition-all">
                        <AvatarImage src={avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-[#1a5353] text-white text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-56 mt-4 mr-2 rounded-xl shadow-xl border-slate-100 bg-white"
                    align="end"
                  >
                    {/* DASHBOARD */}
                    {profile?.role == "professional" && (
                      <DropdownMenuItem className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent">
                        <Link
                          href={dashboardLink}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#1a5353] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {profile?.username && profile?.role == "professional" && (
                      <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                        <Link
                          href={`/u/${profile.username}`}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#334155] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white"
                        >
                          <User className="h-4 w-4" />
                          Public Profile
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                    {/* LIST BUSINESS */}
                    {profile?.role == "reviewer" && (
                      <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                        <button
                          onClick={() =>
                            router.push("/auth/signup?role=professional")
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#FB923C] transition-colors hover:bg-[#FB923C] hover:text-white focus:bg-[#FB923C] focus:text-white"
                        >
                          <PlusCircle className="h-4 w-4" />
                          List your Business
                        </button>
                      </DropdownMenuItem>
                    )}

                    {/* LOGOUT */}
                    <DropdownMenuItem className="p-0 focus:bg-transparent data-highlighted:bg-transparent">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#FB923C] transition-colors hover:bg-[#FB923C] hover:text-white focus:bg-[#FB923C] focus:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/auth/login"
                    className="text-sm font-bold text-[#334155] hover:text-[#1a5353] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-[#1a5353] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#154242] hover:shadow-lg hover:shadow-[#1a5353]/20 transition-all active:scale-95">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              className="lg:hidden p-2 text-[#334155] hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Open Main Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* MOBILE MENU DROPDOWN */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 pointer-events-auto">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="flex flex-col gap-1">
                <Link
                  href="/categories"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-[#334155] font-medium"
                  onClick={()=> setIsMenuOpen(!isMenuOpen)}
                >
                  Browse Categories
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-[#334155] font-medium"
                  onClick={()=> setIsMenuOpen(!isMenuOpen)}
                >
                  About Us
                </Link>

                {profile?.role !== "professional" && (
                  <Link
                    href="/auth/signup?role=professional"
                    className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium"
                    onClick={()=> setIsMenuOpen(!isMenuOpen)}
                  >
                    For Business
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-teal-900 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-slate-900">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    {profile?.role === "professional" && (
                      <Link href={dashboardLink}>
                        <Button
                          variant="outline"
                          className="w-full gap-2 px-3 py-2 rounded-md text-[#1a5353] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white mb-2"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Go to
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    {profile?.role == "professional" && (
                      <Link href="/auth/signup?role=professional">
                        <Button
                          variant="outline"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#334155] transition-colors hover:bg-[#1a5353] hover:text-white focus:bg-[#1a5353] focus:text-white mb-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Public Profile
                        </Button>
                      </Link>
                    )}
                    {profile?.role == "reviewer" && (
                      <Link href="/auth/signup?role=professional">
                        <Button
                          variant="outline"
                          className="w-full justify-start mt-2 border-[#FB923C]/30 text-[#FB923C] bg-[#FB923C]/10 hover:bg-orange-100 rounded-xl"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> List your
                          Business
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[#FB923C] transition-colors hover:bg-[#FB923C] hover:text-white focus:bg-[#FB923C] focus:text-white"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full rounded-xl">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full bg-teal-900 hover:bg-[#154242] rounded-xl">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
}
