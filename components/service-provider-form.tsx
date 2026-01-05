"use client"

import type React from "react"
import { supabase } from "@/lib/supabaseClient"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Upload, Check, AlertCircle } from "lucide-react"

const PROFESSIONS = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Web Developer",
  "Designer",
  "Consultant",
  "Accountant",
  "Lawyer",
  "Other",
]

interface FormData {
  fullName: string
  profession: string
  customProfession: string
  bio: string
  city: string
  photo: File | null
}

interface ValidationErrors {
  fullName?: string
  profession?: string
  bio?: string
  city?: string
  photo?: string
}

export function ServiceProviderForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    profession: "",
    customProfession: "",
    bio: "",
    city: "",
    photo: null,
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.profession) {
      newErrors.profession = "Please select a profession"
    }

    if (formData.profession === "Other" && !formData.customProfession.trim()) {
      newErrors.profession = "Please enter your profession"
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required"
    }

    if (formData.bio.length > 300) {
      newErrors.bio = "Bio must be 300 characters or less"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.photo) {
      newErrors.photo = "Profile photo is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleProfessionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      profession: value,
      customProfession: value !== "Other" ? "" : prev.customProfession,
    }))

    if (errors.profession) {
      setErrors((prev) => ({
        ...prev,
        profession: undefined,
      }))
    }
  }

  const handlePhotoChange = (
  e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
) => {
  let file: File | null = null

  if ("dataTransfer" in e) {
    // Drag & drop
    e.preventDefault()
    e.stopPropagation()
    file = e.dataTransfer.files?.[0] || null
  } else {
    // File input change
    file = e.target.files?.[0] || null
  }

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }))
      if (errors.photo) {
        setErrors((prev) => ({
          ...prev,
          photo: undefined,
        }))
      }
    }
    reader.readAsDataURL(file)
  }
}


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return

  setIsSaving(true)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    alert("Not logged in")
    setIsSaving(false)
    return
  }

  const username =
    user.email?.split("@")[0].toLowerCase() + "-" + user.id.slice(0, 5)

  const { error } = await supabase.from("profiles").upsert({
    id: user.id, 
    full_name: formData.fullName,
    profession:
      formData.profession === "Other"
        ? formData.customProfession
        : formData.profession,
    bio: formData.bio,
    city: formData.city,
    username,
    role: "provider", 
  })

  setIsSaving(false)

  if (error) {
    console.error("PROFILE SAVE ERROR:", error)
    alert(error.message)
    return
  }

  alert("Profile saved successfully!")
  window.location.href = "/service-provider-dashboard"
}


  const bioLength = formData.bio.length

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-linear-to-b from-background to-muted/30 px-4 py-8 lg:py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Create Your Profile</h1>
          <p className="mt-2 text-muted-foreground">Fill in your details to get started</p>
        </div>

        {/* Form Card */}
        <Card className="border border-border/50 p-6 shadow-sm lg:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "border-destructive" : ""}
                required
              />
              {errors.fullName && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <label htmlFor="profession" className="text-sm font-semibold text-foreground">
                Profession <span className="text-destructive">*</span>
              </label>
              <Select value={formData.profession} onValueChange={handleProfessionChange}>
                <SelectTrigger id="profession" className={errors.profession ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((prof) => (
                    <SelectItem key={prof} value={prof}>
                      {prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.profession && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.profession}
                </div>
              )}
            </div>

            {/* Custom Profession */}
            {formData.profession === "Other" && (
              <div className="space-y-2 -mt-4">
                <Input
                  name="customProfession"
                  type="text"
                  placeholder="Enter your profession"
                  value={formData.customProfession}
                  onChange={handleInputChange}
                  className="text-sm"
                />
              </div>
            )}

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bio" className="text-sm font-semibold text-foreground">
                  Bio <span className="text-destructive">*</span>
                </label>
                <span className={`text-xs ${bioLength > 300 ? "text-destructive" : "text-muted-foreground"}`}>
                  {bioLength}/300
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself and your expertise..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={300}
                className={`resize-none ${errors.bio ? "border-destructive" : ""}`}
                required
              />
              {errors.bio && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.bio}
                </div>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-semibold text-foreground">
                City <span className="text-destructive">*</span>
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="New York"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? "border-destructive" : ""}
                required
              />
              {errors.city && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.city}
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Profile Photo <span className="text-destructive">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handlePhotoChange}
                className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  errors.photo
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="space-y-3">
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg mx-auto">
                      <Image
                        src={photoPreview || "/placeholder.svg"}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-primary hover:underline"
                    >
                      Change photo
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </button>
                )}
              </div>
              {errors.photo && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.photo}
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-4 lg:px-0">
          <div className="flex-1">
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Profile saved successfully!
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={isSaving || saved} className="min-w-32" size="lg">
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* Spacing for fixed button */}
      <div className="h-24" />
    </div>
  )
}
