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
  Instagram, Linkedin, Globe, Phone, 
  CheckCircle2
} from "lucide-react"

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
  
  // --- DYNAMIC DATA STATE ---
  const [taxonomy, setTaxonomy] = useState<any[]>([]) // Holds all data from DB
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]) 
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  
  // Selection State
  const [selectedSector, setSelectedSector] = useState("")
  const [selectedProfession, setSelectedProfession] = useState("")
  const [customProfession, setCustomProfession] = useState("")
  
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [insta, setInsta] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [website, setWebsite] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 1. FETCH TAXONOMY ON LOAD
  useEffect(() => {
    async function loadTaxonomy() {
      const { data } = await supabase.from('profession_taxonomy').select('*')
      if (data) {
        setTaxonomy(data)
        // Extract unique sectors (e.g., ["Technology", "Health"])
        const sectors = Array.from(new Set(data.map((item: any) => item.sector))) as string[]
        setUniqueSectors(sectors)
      }
    }
    loadTaxonomy()
  }, [])

  // 2. UPDATE ROLES WHEN SECTOR CHANGES
  useEffect(() => {
    if (selectedSector) {
      const roles = taxonomy
        .filter((t: any) => t.sector === selectedSector)
        .map((t: any) => t.profession)
      setAvailableRoles(roles)
      setSelectedProfession("") // Reset selection
    }
  }, [selectedSector, taxonomy])

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "professional") setRole("professional")
  }, [searchParams])

  // Avatar Preview
  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile)
      setAvatarPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    let finalProfession = ""

    // --- LOGIC: HANDLE "OTHER" & SAVE NEW PROFESSION ---
    if (role === 'professional') {
      if (selectedProfession === "Other") {
        if (!customProfession) {
          alert("Please type your specific profession.")
          setIsLoading(false)
          return
        }
        finalProfession = customProfession
        
        // ** MAGIC PART: AUTO-ADD TO DATABASE **
        // We assume the user is honest. You can add an admin approval step later if needed.
        // We do this AFTER signup usually, but let's just use the value for now.
        // The actual insert happens after we confirm the user is created below.
      } else {
        finalProfession = selectedProfession
      }

      if (!selectedSector || !finalProfession) {
        alert("Please complete your professional details.")
        setIsLoading(false)
        return
      }
    }

    // 1. SIGN UP USER
    const metaData: any = {
      full_name: fullName,
      username: username.toLowerCase().replace(/\s/g, ''),
      role: role,
    }

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

    if (data.user) {
      
      // 2. IF "OTHER" WAS USED -> ADD TO MASTER LIST
      if (role === 'professional' && selectedProfession === "Other") {
        const { error: taxError } = await supabase
          .from('profession_taxonomy')
          .insert({
             sector: selectedSector,
             profession: customProfession // e.g. "AI Prompt Engineer"
          })
          // We ignore duplicate errors in case someone else just added it
          if (taxError && taxError.code !== '23505') {
            console.error("Failed to add to taxonomy", taxError)
          }
      }

      // 3. CREATE PROFILE
      const profileData: any = {
        id: data.user.id,
        username: metaData.username,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
      }
      
      // Avatar Upload
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${data.user.id}-${Date.now()}.${fileExt}`
          await supabase.storage.from('avatars').upload(fileName, avatarFile)
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
          profileData.avatar_url = publicUrl
        } catch (err) {
          console.error("Avatar error", err)
        }
      }

      // Professional Fields
      if (role === 'professional') {
        profileData.profession = finalProfession
        // Note: You might want to save the 'sector' in profiles too for easier filtering later!
        // For now we stick to profession as requested.
        profileData.phone_number = phone
        profileData.instagram_url = insta
        profileData.linkedin_url = linkedin
        profileData.website_url = website
        profileData.bio = bio
      }

      const { error: profileError } = await supabase.from('profiles').upsert(profileData)

      if (profileError) {
        alert(`Profile setup failed: ${profileError.message}`)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(false)
    alert("Signup successful!")
    router.push(role === 'professional' ? "/service-provider-dashboard" : "/explore")
  }

  return (
    <div className="fixed inset-0 z-[50] w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-1 flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
               <div className="flex items-center gap-2 justify-center">
                 <div className="bg-teal-900 text-white p-2 rounded-lg font-bold text-xl">TR</div>
                 <span className="text-teal-900 text-2xl font-bold tracking-tight">TrueTalk</span>
               </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Role Tabs */}
            <div className="bg-slate-50 p-1 rounded-xl">
              <Tabs value={role} onValueChange={setRole} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-11 p-0">
                  <TabsTrigger value="reviewer" className="gap-2 rounded-lg"><User className="w-4 h-4"/> I want to Review</TabsTrigger>
                  <TabsTrigger value="professional" className="gap-2 rounded-lg"><Briefcase className="w-4 h-4"/> I am a Professional</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Avatar (Simplified for brevity) */}
            <div className="flex justify-center">
               {/* ... (Keep your existing avatar code here) ... */}
               <div className="text-slate-400 text-xs">Avatar Upload Section</div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500 mb-1">Full Name</label><Input value={fullName} onChange={e=>setFullName(e.target.value)} required /></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1">Username</label><Input value={username} onChange={e=>setUsername(e.target.value)} required /></div>
            </div>

            {/* === DYNAMIC SECTOR/PROFESSION SELECTOR === */}
            {role === "professional" && (
              <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 animate-in fade-in">
                
                {/* 1. SECTOR SELECT */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Sector <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-sm"
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value)
                      setSelectedProfession("") 
                      setCustomProfession("")
                    }}
                  >
                    <option value="">-- Choose Sector --</option>
                    {uniqueSectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* 2. PROFESSION SELECT */}
                {selectedSector && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Profession <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-sm"
                      value={selectedProfession}
                      onChange={(e) => setSelectedProfession(e.target.value)}
                    >
                      <option value="">-- Choose Profession --</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Other" className="font-bold text-teal-700 bg-teal-50">+ Other (Add New)</option>
                    </select>
                  </div>
                )}

                {/* 3. CUSTOM INPUT (Saves to DB on submit) */}
                {selectedProfession === "Other" && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Enter New Profession <span className="text-red-500">*</span></label>
                    <Input 
                      placeholder="e.g. AI Prompt Engineer" 
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      className="h-11 border-teal-500 bg-white"
                      required
                    />
                    <p className="text-[10px] text-teal-600 mt-1">This will be added to the {selectedSector} list for future users.</p>
                  </div>
                )}

                {/* Bio & Socials (Simplified) */}
                <Textarea placeholder="Short Bio" value={bio} onChange={e=>setBio(e.target.value)} className="bg-white text-xs" />
              </div>
            )}

            {/* Email/Pass */}
            <div className="space-y-4">
               <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
               <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-teal-800 hover:bg-teal-900 text-white">
              {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
          </form>
          
           <div className="text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/auth/login" className="text-teal-700 font-bold hover:underline">Log in</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Keep your existing PC visual code) */}
      <div className="hidden lg:flex relative bg-slate-900 h-full overflow-hidden flex-col justify-between p-16">
         <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-black/80" />
         <div className="relative z-10 text-white mt-auto">
            <h1 className="text-4xl font-bold">Build your Trust.</h1>
         </div>
      </div>
    </div>
  )
}