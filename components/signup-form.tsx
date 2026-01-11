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

// Icons
import { 
  Loader2, User, Briefcase, Camera, 
  ShieldCheck, Mail
} from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // --- STATE ---
  const [step, setStep] = useState<'form' | 'otp'>('form') // Controls View
  const [isLoading, setIsLoading] = useState(false)

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
  
  // Professional Data
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [insta, setInsta] = useState("")
  const [linkedin, setLinkedin] = useState("")
  
  // Taxonomy Data
  const [taxonomy, setTaxonomy] = useState<any[]>([]) 
  const [uniqueSectors, setUniqueSectors] = useState<string[]>([]) 
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState("")
  const [selectedProfession, setSelectedProfession] = useState("")
  const [customProfession, setCustomProfession] = useState("")

  // Fetch Taxonomy
  useEffect(() => {
    async function loadTaxonomy() {
      const { data } = await supabase.from('profession_taxonomy').select('*')
      if (data) {
        setTaxonomy(data)
        const sectors = Array.from(new Set(data.map((item: any) => item.sector))) as string[]
        setUniqueSectors(sectors)
      }
    }
    loadTaxonomy()
  }, [])

  // Update Roles
  useEffect(() => {
    if (selectedSector) {
      const roles = taxonomy.filter((t: any) => t.sector === selectedSector).map((t: any) => t.profession)
      setAvailableRoles(roles)
      setSelectedProfession("")
    }
  }, [selectedSector, taxonomy])

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "professional") setRole("professional")
  }, [searchParams])

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile)
      setAvatarPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  // --- STEP 1: SEND EMAIL OTP ---
  async function onSignup(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    let finalProfession = ""
    if (role === 'professional') {
       if (selectedProfession === "Other") {
         if (!customProfession) {
            alert("Please type your specific profession.")
            setIsLoading(false)
            return
         }
       } else if (!selectedSector || !selectedProfession) {
          alert("Please complete your professional details.")
          setIsLoading(false)
          return
       }
    }

    // 1. Sign Up (Sends Email with Code)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        // We still pass metadata just in case, but we won't use the trigger
        data: { full_name: fullName, username: username, role: role }
      },
    })

    if (error) {
      setIsLoading(false)
      alert(error.message)
      return
    }

    // Success -> Move to OTP Step
    setIsLoading(false)
    setStep('otp')
  }

  // --- STEP 2: VERIFY OTP & CREATE PROFILE ---
  async function onVerifyOtp() {
    setIsLoading(true)

    // 1. Verify Email OTP
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

    // --- NOW WE CREATE THE PROFILE (Only after verification) ---
    const userId = session.user.id
    let finalProfession = selectedProfession === "Other" ? customProfession : selectedProfession

    // 2. Upload Avatar
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

    // 3. Update Taxonomy (If needed)
    if (role === 'professional' && selectedProfession === "Other") {
      await supabase.from('profession_taxonomy').insert({
         sector: selectedSector,
         profession: customProfession
      })
    }

    // 4. Insert Profile (ONLY for Professionals)
    if (role === 'professional') {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: username.toLowerCase().replace(/\s/g, ''),
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
        avatar_url: avatarUrl,
        profession: finalProfession,
        bio: bio,
        website_url: website,
        instagram_url: insta,
        linkedin_url: linkedin
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        alert("Account verified, but profile setup had an issue. Please contact support.")
      }
    }

    setIsLoading(false)
    alert("Account Verified Successfully!")
    router.push(role === 'professional' ? "/service-provider-dashboard" : "/")
  }

  return (
    <div className="fixed inset-0 z-[50] w-screen h-screen bg-white flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* LEFT SIDE */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-white h-full w-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
               <div className="flex items-center gap-2 justify-center">
                 <div className="bg-teal-900 text-white p-2 rounded-lg font-bold text-xl">TR</div>
                 <span className="text-teal-900 text-2xl font-bold tracking-tight">TrueTalk</span>
               </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 'form' ? "Create an account" : "Verify Email"}
            </h2>
            {step === 'otp' && (
               <p className="text-slate-500 mt-2">Enter the code sent to {email}</p>
            )}
          </div>

          {/* === STEP 1: FORM === */}
          {step === 'form' && (
            <form onSubmit={onSignup} className="space-y-6 animate-in fade-in slide-in-from-left-4">
              {/* Role Tabs */}
              <div className="bg-slate-50 p-1 rounded-xl">
                <Tabs value={role} onValueChange={setRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-11 p-0">
                    <TabsTrigger value="reviewer" className="gap-2 rounded-lg"><User className="w-4 h-4"/> Reviewer</TabsTrigger>
                    <TabsTrigger value="professional" className="gap-2 rounded-lg"><Briefcase className="w-4 h-4"/> Professional</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                 <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-teal-500 transition-colors">
                      {avatarPreview ? (
                        <img src={avatarPreview} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                 </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 mb-1">Full Name</label><Input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="John Doe" /></div>
                <div><label className="text-xs font-bold text-slate-500 mb-1">Username</label><Input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="johndoe" /></div>
              </div>

              <div className="space-y-4">
                 <div><label className="text-xs font-bold text-slate-500 mb-1">Email Address</label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com" /></div>
                 <div><label className="text-xs font-bold text-slate-500 mb-1">Password</label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" /></div>
              </div>

              {/* Professional Fields */}
              {role === "professional" && (
                <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Sector</label>
                    <select className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-sm" value={selectedSector} onChange={(e) => { setSelectedSector(e.target.value); setSelectedProfession(""); setCustomProfession("") }}>
                      <option value="">-- Choose Sector --</option>
                      {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {selectedSector && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">Select Profession</label>
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
                  <Textarea placeholder="Short Bio" value={bio} onChange={e=>setBio(e.target.value)} className="bg-white text-xs" />
                  <div className="grid grid-cols-2 gap-3">
                     <Input placeholder="Website URL" value={website} onChange={e=>setWebsite(e.target.value)} className="bg-white text-xs h-9" />
                     <Input placeholder="Instagram URL" value={insta} onChange={e=>setInsta(e.target.value)} className="bg-white text-xs h-9" />
                     <Input placeholder="LinkedIn URL" value={linkedin} onChange={e=>setLinkedin(e.target.value)} className="bg-white text-xs h-9 col-span-2" />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base">
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* === STEP 2: OTP === */}
          {step === 'otp' && (
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
                   <Input 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                      placeholder="123456" 
                      className="text-center text-2xl tracking-widest h-14 font-bold"
                      maxLength={6}
                   />
                </div>

                <Button onClick={onVerifyOtp} disabled={isLoading || otp.length < 6} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base">
                   {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Create Profile"}
                </Button>

                <button onClick={() => setStep('form')} className="w-full text-center text-sm text-slate-400 hover:text-slate-600">
                   Wrong email? Go back
                </button>
             </div>
          )}

          <div className="text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link href="/auth/login" className="text-teal-700 font-bold hover:underline">Log in</Link>
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