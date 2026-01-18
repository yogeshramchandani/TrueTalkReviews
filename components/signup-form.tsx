"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleAuthButton from "@/app/auth/google-button"

// Icons
import { 
  Loader2, User, Briefcase, Camera, 
  MapPin, Phone, Mail, Lock
} from "lucide-react"

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // [CHANGE 1]: Capture the 'next' parameter (Where they want to go after signup)
  const next = searchParams.get("next")

  // --- STATE ---
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [isLoading, setIsLoading] = useState(false)
  
  // Upgrade State
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Auth Data
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  
  // Profile Data
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("reviewer")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Location & Contact Data
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [address, setAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Professional Data
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [insta, setInsta] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [reddit, setReddit] = useState("")
  
  // Taxonomy Data
  const [taxonomy, setTaxonomy] = useState<any[]>([]) 
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]) 
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState("")
  const [selectedProfession, setSelectedProfession] = useState("")
  const [customProfession, setCustomProfession] = useState("")

  useEffect(() => {
    async function loadTaxonomy() {
      const { data, error } = await supabase.from('profession_taxonomy').select('*')
      if (data) {
        setTaxonomy(data)
        const sectors = Array.from(new Set(data.map((item: any) => item.sector))) as string[]
        setUniqueSectors(sectors)
      }
    }
    loadTaxonomy()
  }, [])

  
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsUpgrading(true)
        setCurrentUserId(session.user.id)
        setRole("professional") 
        setEmail(session.user.email || "")

        // --- Fetch from Database to get the correct Username ---
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name') 
          .eq('id', session.user.id)
          .single()

        if (profile) {
           setUsername(profile.username || "") 
           setFullName(profile.full_name || "")
        } else {
           const meta = session.user.user_metadata
           setFullName(meta.full_name || "")
           setUsername(meta.username || "")
        }
      }
    }
    checkSession()
  }, [])

  // 3. Update Roles based on Sector
  useEffect(() => {
    if (selectedSector) {
      const roles = taxonomy.filter((t: any) => t.sector === selectedSector).map((t: any) => t.profession)
      setAvailableRoles(roles)
      setSelectedProfession("")
    }
  }, [selectedSector, taxonomy])

  useEffect(() => {
    if (!isUpgrading) {
      const roleParam = searchParams.get("role")
      if (roleParam === "professional") setRole("professional")
    }
  }, [searchParams, isUpgrading])

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512000) {
      alert("Image is too large! Please upload an image smaller than 500KB.")
      e.target.value = "" 
      return
    }
    setAvatarFile(file)
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)
  }

  const handleLockedFieldClick = () => {
    if (isUpgrading) {
      alert("Don't worry! You can update this information from your Professional Dashboard after listing your business.")
    }
  }

  // --- SUBMIT HANDLER ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (role === 'professional') {
       if (selectedProfession === "Other" && !customProfession) {
         alert("Please type your specific profession.")
         setIsLoading(false)
         return
       } else if ((!selectedSector || !selectedProfession) && selectedProfession !== "Other") {
         alert("Please select a sector and profession.")
         setIsLoading(false)
         return
       }
    }

    // PATH A: UPGRADE EXISTING USER
    if (isUpgrading && currentUserId) {
        await createProfile(currentUserId)
        return
    }

    // --- PRE-CHECKS (Only for new users) ---
    if (!isUpgrading) {
      
      // 1. Check Username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase().replace(/\s/g, ''))
        .single()

      if (existingUser) {
        setIsLoading(false)
        alert("This username is already taken. Please choose another.")
        return 
      }

      // 2. Check Email (Checking public.profiles table)
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (existingEmail) {
        setIsLoading(false)
        alert("User already exists, try to login.")
        // Redirect to Login WITH the next param
        router.push(`/auth/login?next=${encodeURIComponent(next || "")}`)
        return 
      }
    }

    // PATH B: NEW USER SIGNUP
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName, username: username, role: role }
      },
    })

    if (error) {
      setIsLoading(false)
      if (error.message.includes("already registered") || error.message.includes("User already exists") || error.message.includes("unique constraint")) {
        alert("User already exists, try to login.")
        router.push(`/auth/login?next=${encodeURIComponent(next || "")}`) 
      } else {
        alert(error.message)
      }
      return
    }

    setIsLoading(false)
    setStep('otp')
  }

  // --- VERIFY OTP ---
  async function onVerifyOtp() {
    setIsLoading(true)
    const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    })

    if (verifyError || !session) {
      setIsLoading(false)
      alert("Invalid Code or Verification Failed.")
      return
    }

    await createProfile(session.user.id)
  }

  // --- SHARED PROFILE CREATION LOGIC ---
  async function createProfile(userId: string) {
    let finalProfession = selectedProfession === "Other" ? customProfession : selectedProfession

    let avatarUrl = null
    if (avatarFile) {
      try {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        await supabase.storage.from('avatars').upload(fileName, avatarFile)
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatarUrl = publicUrl
      } catch (err) {
        console.error("Avatar error", err)
      }
    }

    // Update Taxonomy if needed (Professionals only)
    if (role === 'professional' && selectedProfession === "Other") {
      await supabase.from('profession_taxonomy').insert({
          sector: selectedSector,
          profession: customProfession
      })
    }

    // --- PREPARE DATA ---
    const profileData = {
        id: userId,
        username: username.toLowerCase().replace(/\s/g, ''),
        full_name: fullName,
        email: email,
        role: role,
        created_at: new Date().toISOString(),
        avatar_url: avatarUrl
    }

    // Add Extra Fields ONLY for Professionals
    if (role === 'professional') {
       Object.assign(profileData, {
         profession: finalProfession,
         bio: bio,
         city: city,
         state: state,
         address: address,
         phone_number: phoneNumber,
         website_url: website,
         instagram_url: insta,
         linkedin_url: linkedin,
         reddit_url:reddit
       })
    }

    // --- INSERT PROFILE ---
    const { error: profileError } = await supabase
       .from('profiles')
       .upsert(profileData)

    
    if (profileError) {
       console.error("Profile creation error:", profileError)
       if (!profileError.message.includes("duplicate key")) {
           alert("Error saving profile: " + profileError.message)
       }
    }

    setIsLoading(false)
    alert(isUpgrading ? "Business Listed Successfully!" : "Account Verified & Profile Created!")
    
    // [CHANGE 2]: REDIRECT LOGIC
    // If 'next' exists, go there. Otherwise, go to dashboard.
    if (next && next !== "/dashboard") {
       router.push(next)
    } else {
       if (role === 'professional') {
         router.push("/service-provider-dashboard")
       } else {
         router.push("/") 
       }
    }
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* LEFT SIDE - Form */}
      <div className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              
          <img 
            src="/logo.png" 
            alt="TrueTalk Logo" 
            className="h-9 w-auto object-contain" 
          />
          <span className="font-bold text-teal-900 text-xl tracking-tight sm:block">
            TruVouch
          </span>
        
            </Link>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isUpgrading ? "Complete Business Profile" : (step === 'form' ? "Create an account" : "Verify Email")}
            </h2>
            
            {isUpgrading && (
               <div className="mt-2 text-sm bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                  Welcome back, <b>{fullName}</b>! Fill in these details to list your business.
               </div>
            )}
            
            {!isUpgrading && step === 'otp' && (
               <p className="text-slate-500 mt-2">Enter the code sent to {email}</p>
            )}
          </div>

          {/* === STEP 1: FORM === */}
          {step === 'form' && (
            <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 pb-10">
              
              {!isUpgrading && (
                <>
                  <div className="bg-slate-50 p-1 rounded-xl">
                    <Tabs value={role} onValueChange={setRole} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-transparent h-11 p-0">
                        <TabsTrigger value="reviewer" className="gap-2 rounded-lg"><User className="w-4 h-4"/> Reviewer</TabsTrigger>
                        <TabsTrigger value="professional" className="gap-2 rounded-lg"><Briefcase className="w-4 h-4"/> Professional</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Google Button */}
                  {role === 'reviewer' && (
                    <div className="relative">
                      {/* Ensure GoogleAuthButton inside captures 'next' url too via useSearchParams */}
                      <GoogleAuthButton />
                      <div className="relative flex items-center justify-center mt-6">
                        <span className="absolute w-full h-px bg-slate-200"></span>
                        <span className="relative bg-white px-3 text-xs text-slate-400 uppercase font-bold">Or continue with email</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Avatar Upload */}
              <div className="flex justify-center">
                  <div className="relative group cursor-pointer text-center">
                     <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-teal-500 transition-colors">
                       {avatarPreview ? (
                         <img src={avatarPreview} className="w-full h-full object-cover" />
                       ) : (
                         <Camera className="w-8 h-8 text-slate-400" />
                       )}
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">Max size: 500KB</p>
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                  </div>
              </div>

              {/* Basic Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div onClick={handleLockedFieldClick} className={isUpgrading ? "cursor-not-allowed opacity-80" : ""}>
                    <label className="text-xs font-bold text-slate-500 mb-1">Full Name {isUpgrading && <Lock className="inline w-3 h-3 ml-1"/>} <span className="text-red-500">*</span></label>
                    <Input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="John Doe" readOnly={isUpgrading} className={isUpgrading ? "bg-slate-100 text-slate-500" : ""} />
                </div>
                <div onClick={handleLockedFieldClick} className={isUpgrading ? "cursor-not-allowed opacity-80" : ""}>
                    <label className="text-xs font-bold text-slate-500 mb-1">Username {isUpgrading && <Lock className="inline w-3 h-3 ml-1"/>} <span className="text-red-500">*</span></label>
                    <Input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="johndoe" readOnly={isUpgrading} className={isUpgrading ? "bg-slate-100 text-slate-500" : ""} />
                </div>
              </div>

              <div className="space-y-4">
                  <div onClick={handleLockedFieldClick} className={isUpgrading ? "cursor-not-allowed opacity-80" : ""}>
                     <label className="text-xs font-bold text-slate-500 mb-1">Email Address {isUpgrading && <Lock className="inline w-3 h-3 ml-1"/>}<span className="text-red-500">*</span></label>
                     <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com" readOnly={isUpgrading} className={isUpgrading ? "bg-slate-100 text-slate-500" : ""} />
                  </div>
                  
                  {!isUpgrading && (
                    <div>
                       <label className="text-xs font-bold text-slate-500 mb-1">Password <span className="text-red-500">*</span></label>
                       <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                  )}
              </div>

              {role === "professional" && (
                <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 animate-in fade-in">
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Sector <span className="text-red-500">*</span></label>
                      <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-sm" value={selectedSector} onChange={(e) => { setSelectedSector(e.target.value); setSelectedProfession(""); setCustomProfession("") }}>
                        <option value="">-- Choose Sector --</option>
                        {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {selectedSector && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Profession <span className="text-red-500">*</span></label>
                        <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-sm" value={selectedProfession} onChange={(e) => setSelectedProfession(e.target.value)}>
                          <option value="">-- Choose Profession --</option>
                          {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          <option value="Other" className="font-bold text-teal-700 bg-teal-50">+ Add New</option>
                        </select>
                      </div>
                    )}
                    {selectedProfession === "Other" && (
                      <Input placeholder="e.g. AI Prompt Engineer" value={customProfession} onChange={e => setCustomProfession(e.target.value)} required className="border-teal-500" />
                    )}
                  </div>

                  <Textarea placeholder="Short Bio (Tell us about your services)" value={bio} onChange={e=>setBio(e.target.value)} className="bg-white text-xs" />
                  
                  <div className="space-y-3 pt-2 border-t border-teal-200/50">
                    <p className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3"/> Location Details</p>
                    <div className="grid grid-cols-2 gap-3">
                       <div><label className="text-[10px] font-bold text-slate-400">City <span className="text-red-500">*</span></label><Input placeholder="Mumbai" value={city} onChange={e=>setCity(e.target.value)} required className="bg-white text-xs h-9" /></div>
                       <div><label className="text-[10px] font-bold text-slate-400">State <span className="text-red-500">*</span></label><Input placeholder="Maharashtra" value={state} onChange={e=>setState(e.target.value)} required className="bg-white text-xs h-9" /></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-400">Full Address </label><Input placeholder="Shop No. 4, Main Market..." value={address} onChange={e=>setAddress(e.target.value)} className="bg-white text-xs h-9" /></div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-teal-200/50">
                      <p className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3"/> Contact & Social (Optional)</p>
                      <Input placeholder="Phone Number (Public)" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="bg-white text-xs h-9" />
                      <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Website URL" value={website} onChange={e=>setWebsite(e.target.value)} className="bg-white text-xs h-9" />
                          <Input placeholder="Instagram URL" value={insta} onChange={e=>setInsta(e.target.value)} className="bg-white text-xs h-9" />
                      </div>
                      <Input placeholder="LinkedIn URL" value={linkedin} onChange={e=>setLinkedin(e.target.value)} className="bg-white text-xs h-9" />
                     <Input placeholder="Reddit URL" value={reddit} onChange={e=>setReddit(e.target.value)} className="bg-white text-xs h-9" />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base">
                {isLoading ? <Loader2 className="animate-spin" /> : (isUpgrading ? "List My Business" : "Send Verification Code")}
              </Button>
            </form>
          )}

          {!isUpgrading && step === 'otp' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl text-center">
                   <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-teal-700" />
                   </div>
                   <h3 className="font-bold text-teal-900 text-lg mb-2">Check your Email</h3>
                   <p className="text-sm text-slate-600">We've sent a confirmation code to <br/><span className="font-mono font-bold text-slate-900">{email}</span></p>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 mb-1">Enter Confirmation Code</label>
                   <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="text-center text-2xl tracking-widest h-14 font-bold" maxLength={8}/>
                </div>

                <Button onClick={onVerifyOtp} disabled={isLoading || otp.length < 6} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base">
                   {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Create Profile"}
                </Button>

                <button onClick={() => setStep('form')} className="w-full text-center text-sm text-slate-400 hover:text-slate-600">Wrong email? Go back</button>
             </div>
          )}

          <div className="text-center text-sm">
            {!isUpgrading && (
               <>
                 <span className="text-slate-500">Already have an account? </span>
                 {/* [CHANGE 3]: This link now carries the 'next' param to the Login page */}
                 <Link href={`/auth/login?next=${encodeURIComponent(next || "")}`} className="text-teal-700 font-bold hover:underline">Log in</Link>
               </>
            )}
            {isUpgrading && (
               <button onClick={() => { supabase.auth.signOut(); window.location.reload() }} className="text-slate-500 hover:text-red-600 underline text-xs">
                 Not you? Log out
               </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Visual) */}
      <div className="hidden lg:flex relative bg-slate-900 h-full overflow-hidden flex-col justify-between p-16">
         <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-black/80" />
         <div className="relative z-10 text-white mt-auto">
            <h1 className="text-4xl font-bold">Build your Trust.</h1>
            <p className="mt-4 text-slate-300 text-lg">Join thousands of professionals and clients building verified connections.</p>
         </div>
      </div>
    </div>
  )
}