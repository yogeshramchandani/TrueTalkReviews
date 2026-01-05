"use client"

import type React from "react"
import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Icons
import { 
  Loader2, User, Briefcase, Camera, AtSign, 
  Instagram, Linkedin, Globe, Phone, ChevronDown, 
  ArrowRight, CheckCircle2, Star
} from "lucide-react"

// --- THE BIG LIST OF PROFESSIONS ---
const professionsList = [
  { value: "software-developer", label: "Software Developer" },
  { value: "graphic-designer", label: "Graphic Designer" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "digital-marketer", label: "Digital Marketer" },
  { value: "seo-specialist", label: "SEO Specialist" },
  { value: "content-writer", label: "Content Writer" },
  { value: "video-editor", label: "Video Editor" },
  { value: "doctor", label: "Doctor / Physician" },
  { value: "dentist", label: "Dentist" },
  { value: "therapist", label: "Therapist / Psychologist" },
  { value: "astrologer", label: "Astrologer" }, 
  { value: "tarot-reader", label: "Tarot Reader" },
  { value: "yoga-instructor", label: "Yoga Instructor" },
  { value: "life-coach", label: "Life Coach" },
  { value: "personal-trainer", label: "Personal Trainer" },
  { value: "lawyer", label: "Lawyer" },
  { value: "real-estate-agent", label: "Real Estate Agent" },
  { value: "architect", label: "Architect" },
  { value: "interior-designer", label: "Interior Designer" },
  { value: "photographer", label: "Photographer" },
  { value: "event-planner", label: "Event Planner" },
  { value: "makeup-artist", label: "Makeup Artist" },
  { value: "hair-stylist", label: "Hair Stylist" },
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "carpenter", label: "Carpenter" },
  { value: "consultant", label: "Business Consultant" },
  { value: "accountant", label: "Accountant / CPA" },
]

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Form State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("reviewer")
  
  // --- SIMPLE SEARCH STATE ---
  const [professionSearch, setProfessionSearch] = useState("") 
  const [professionValue, setProfessionValue] = useState("")   
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [insta, setInsta] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [website, setWebsite] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Filter the list based on what user types
  const filteredProfessions = professionsList.filter((p) =>
    p.label.toLowerCase().includes(professionSearch.toLowerCase())
  )

  // Avatar Preview Logic
  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile)
      setAvatarPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "professional") setRole("professional")
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // 1. Validation
    if (role === 'professional' && !professionValue) {
      alert("Please select a profession from the list.")
      setIsLoading(false)
      return
    }

    const metaData: any = {
      full_name: fullName,
      username: username.toLowerCase().replace(/\s/g, ''),
      role: role,
    }

    // 2. Sign Up (Creates User in Auth Table)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metaData },
    })

    if (error) {
      setIsLoading(false)
      alert(error.message)
      return
    }

    // 3. Create Public Profile
    if (data.user) {
      
      const profileData: any = {
        id: data.user.id,
        username: metaData.username,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
      }
      
      // Avatar Upload Logic
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${data.user.id}-${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile)

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName)
            profileData.avatar_url = publicUrl
          }
        } catch (err) {
          console.error("Avatar upload failed", err)
        }
      }

      // Add Professional Fields
      if (role === 'professional') {
        profileData.profession = professionValue 
        profileData.phone_number = phone
        profileData.instagram_url = insta
        profileData.linkedin_url = linkedin
        profileData.website_url = website
        profileData.bio = bio
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (profileError) {
        console.error("Supabase Profile Error:", profileError) 
        alert(`Profile setup failed: ${profileError.message}`)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(false)
    alert("Signup successful!")
    
    if (role === 'professional') {
      router.push("/service-provider-dashboard")
    } else {
      router.push("/explore")
    }
  }

  return (
    // FULL SCREEN CONTAINER
    <div className="fixed inset-0 z-[50] w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* 1. LEFT SIDE - SCROLLABLE FORM */}
      <div className="flex flex-1 flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
               <div className="flex items-center gap-2 justify-center">
                 <div className="bg-teal-900 text-white p-2 rounded-lg font-bold text-xl">TR</div>
                 <span className="text-teal-900 text-2xl font-bold tracking-tight">TrueTalk</span>
               </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Join the community of trust today.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Role Tabs */}
            <div className="bg-slate-50 p-1 rounded-xl">
              <Tabs value={role} onValueChange={setRole} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-11 p-0">
                  <TabsTrigger value="reviewer" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-teal-800 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                    <User className="w-4 h-4" /> I want to Review
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-teal-800 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                    <Briefcase className="w-4 h-4" /> I am a Professional
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Avatar Upload */}
           {/* Avatar Upload Section */}
<div className="flex justify-center">
  <div className="flex flex-col items-center gap-2">
    <label 
      htmlFor="signup-avatar" 
      className="cursor-pointer group relative w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-200 hover:border-teal-500 transition-all overflow-hidden shadow-sm"
    >
      {avatarPreview ? (
        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <User className="w-10 h-10 text-slate-300 group-hover:text-teal-500 transition-colors" />
      )}
      
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera className="w-8 h-8 text-white" />
      </div>

      <input 
        id="signup-avatar" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // 100KB = 100 * 1024 bytes
            if (file.size > 100 * 1024) {
              alert("File size is too large! Please choose an image under 100KB.");
              // Clear the input so they can try again
              e.target.value = ""; 
              return;
            }
            setAvatarFile(file);
          }
        }} 
      />
    </label>
    
    <div className="flex flex-col items-center">
      <span className="text-xs uppercase font-bold tracking-wider text-teal-600 group-hover:underline cursor-pointer">
        {avatarPreview ? "Change Photo" : "Upload Photo"}
      </span>
      <span className="text-[10px] text-slate-400 mt-1">
        Max 100KB
      </span>
    </div>
  </div>
</div>

            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Full Name</label>
                <Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 bg-slate-50 border-slate-200 focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Username</label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="johndoe" value={username} onChange={(e) => setUsername(e.target.value)} required className="h-11 pl-9 bg-slate-50 border-slate-200 focus:border-teal-500" />
                </div>
              </div>
            </div>

            {/* === PROFESSIONAL SPECIFIC FIELDS === */}
            {role === "professional" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                
                <div className="relative">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Profession / Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      placeholder="Type to search (e.g. Astrologer)..."
                      value={professionSearch}
                      onChange={(e) => {
                        setProfessionSearch(e.target.value)
                        setShowDropdown(true)
                        if (e.target.value === "") setProfessionValue("")
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="h-11 bg-white border-slate-200 focus:border-teal-500"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* SEARCH DROPDOWN */}
                  {showDropdown && professionSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProfessions.length > 0 ? (
                        filteredProfessions.map((p) => (
                          <div
                            key={p.value}
                            className="px-4 py-2 hover:bg-teal-50 hover:text-teal-800 cursor-pointer text-sm"
                            onClick={() => {
                              setProfessionSearch(p.label)
                              setProfessionValue(p.value)
                              setShowDropdown(false)
                            }}
                          >
                            {p.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-slate-400">No match found.</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Social Links Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Phone className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 pl-8 text-xs bg-white" />
                  </div>
                  <div className="relative">
                    <Instagram className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                    <Input placeholder="Instagram" value={insta} onChange={(e) => setInsta(e.target.value)} className="h-9 pl-8 text-xs bg-white" />
                  </div>
                  <div className="relative">
                    <Linkedin className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                    <Input placeholder="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="h-9 pl-8 text-xs bg-white" />
                  </div>
                  <div className="relative">
                    <Globe className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
                    <Input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} className="h-9 pl-8 text-xs bg-white" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Short Bio</label>
                  <Textarea placeholder="Describe your services in a few words..." className="bg-white resize-none text-xs" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} required={role === "professional"} />
                </div>
              </div>
            )}

            {/* Email & Pass */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-slate-50 border-slate-200 focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-slate-50 border-slate-200 focus:border-teal-500" />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-lg shadow-teal-900/10 transition-all">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/auth/login" className="text-teal-700 hover:text-teal-900 font-bold hover:underline">Log in</Link>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE - DECORATIVE (PC Only) */}
      <div className="hidden lg:flex relative bg-slate-900 h-full overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-30 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
            alt="Meeting background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-black/80" />
        </div>

        <div className="relative z-10 text-white mt-auto">
          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 text-xs font-bold uppercase tracking-wider">
              Join the Community
            </span>
          </div>
          <blockquote className="text-4xl font-medium leading-tight mb-8">
            "Your reputation is your currency. Start building a trusted profile today."
          </blockquote>
          
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-slate-400 text-sm mt-1">Active Professionals</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50k+</p>
              <p className="text-slate-400 text-sm mt-1">Verified Reviews</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-700">
           <CheckCircle2 className="w-8 h-8 text-teal-400" />
           <div>
             <p className="text-white font-bold text-sm">Free to Join</p>
             <p className="text-teal-200 text-xs">No hidden fees</p>
           </div>
        </div>
      </div>
    </div>
  )
}