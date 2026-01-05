"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthHeader } from "@/components/auth-header" // Ensure this path is correct
import { Loader2, Camera, Briefcase } from "lucide-react"

export default function UpgradeToProfessional() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Professional Fields
  const [profession, setProfession] = useState("")
  const [designation, setDesignation] = useState("") // e.g. Dr., CA, Er.
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // 1. Check if user is actually logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login?redirect=/auth/upgrade")
      }
    }
    checkUser()
  }, [])

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = null

      // A. Upload Profile Pic (If selected)
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Make sure you created this bucket in Supabase!
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError
        
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        avatarUrl = publicUrl
      }

      // B. Update User Metadata (Change Role to Professional)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: 'professional',
          profession: profession,
          designation: designation,
          bio: bio,
          avatar_url: avatarUrl || undefined // Only update if new image exists
        }
      })

      if (updateError) throw updateError

      alert("Profile Upgraded! Welcome, Professional.")
      router.push("/service-provider-dashboard")

    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30 p-4">
      <Card className="p-8 border border-border shadow-xl max-w-lg w-full">
        <AuthHeader 
          title="Complete Your Professional Profile" 
          subtitle="You are almost there! Add your professional details to start receiving reviews." 
        />

        <form onSubmit={handleUpgrade} className="space-y-6 mt-6">
          
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="avatar-upload" className="cursor-pointer group relative w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors overflow-hidden">
               {avatarFile ? (
                 <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
               )}
               <input 
                 id="avatar-upload" 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
               />
            </label>
            <span className="text-xs text-muted-foreground">Upload Profile Photo</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Designation */}
             <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
              <Select onValueChange={setDesignation}>
                <SelectTrigger>
                  <SelectValue placeholder="Dr. / Mr." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                  <SelectItem value="CA">CA</SelectItem>
                  <SelectItem value="Adv.">Adv.</SelectItem>
                  <SelectItem value="Er.">Er.</SelectItem>
                  <SelectItem value="Mr.">Mr.</SelectItem>
                  <SelectItem value="Ms.">Ms.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Profession */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Profession</label>
              <Select onValueChange={setProfession} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Professional Bio</label>
            <Textarea 
              placeholder="Tell clients about your experience, years of practice, and specialties..." 
              className="resize-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-md">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete & Create Profile"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By clicking Complete, you agree to switch your account to a Professional Account.
          </p>
        </form>
      </Card>
    </div>
  )
}