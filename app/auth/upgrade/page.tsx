"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthHeader } from "@/components/auth-header"

import { Loader2, Camera } from "lucide-react"

export default function UpgradeToProfessional() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Professional fields
  const [profession, setProfession] = useState("")
  const [designation, setDesignation] = useState("")
  const [bio, setBio] = useState("")

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  /* -------------------------------------------------
     Check if user is logged in
  --------------------------------------------------*/
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login?redirect=/auth/upgrade")
      }
    }

    checkUser()
  }, [router])

  /* -------------------------------------------------
     Handle avatar preview safely (no memory leaks)
  --------------------------------------------------*/
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile])

  /* -------------------------------------------------
     Submit handler
  --------------------------------------------------*/
  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl: string | null = null

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: "professional",
          profession,
          designation,
          bio,
          avatar_url: avatarUrl ?? undefined,
        },
      })

      if (updateError) throw updateError

      alert("Profile upgraded successfully 🎉")
      router.push("/service-provider-dashboard")
    } catch (error: any) {
      alert(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30 p-4">
      <Card className="p-8 border border-border shadow-xl max-w-lg w-full">
        <AuthHeader
          title="Complete Your Professional Profile"
          subtitle="You’re almost there! Add your professional details to start receiving reviews."
        />

        <form onSubmit={handleUpgrade} className="space-y-6 mt-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-2">
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer group relative w-24 h-24 rounded-full bg-muted
                         flex items-center justify-center border-2 border-dashed
                         border-muted-foreground/50 hover:border-primary
                         transition-colors overflow-hidden"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
              )}

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setAvatarFile(e.target.files?.[0] || null)
                }
              />
            </label>

            <span className="text-xs text-muted-foreground">
              Upload Profile Photo
            </span>
          </div>

          {/* Designation + Profession */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Title
              </label>
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

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Profession
              </label>
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
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Professional Bio
            </label>
            <Textarea
              placeholder="Tell clients about your experience, years of practice, and specialties..."
              className="resize-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !profession}
            className="w-full h-11 text-md"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Complete & Create Profile"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking Complete, you agree to switch your account to a
            Professional Account.
          </p>
        </form>
      </Card>
    </div>
  )
}