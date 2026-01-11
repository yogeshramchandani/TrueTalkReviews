"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Edit2, Save, X, Camera, User, Phone, Instagram, Linkedin, Globe, MapPin, Twitter, Facebook } from "lucide-react"

// 1. UPDATE INTERFACE to include Address and State
interface ProfileData {
  id: string
  username: string
  full_name: string
  profession: string
  bio: string
  avatar_url: string | null
  // New Fields
  phone_number?: string | null
  address?: string | null      // Added
  city?: string | null
  state?: string | null        // Added
  instagram_url?: string | null
  linkedin_url?: string | null
  website_url?: string | null
}

interface Props {
  profile: ProfileData
  onUpdate: () => void 
}

export function EditableProfileCard({ profile, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!profile) {
    return <div className="p-6 text-center text-slate-500">Loading profile data...</div>
  }

  // Initialize form data 
  const [formData, setFormData] = useState({
    ...profile,
    phone_number: profile.phone_number || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    instagram_url: profile.instagram_url || '',
    linkedin_url: profile.linkedin_url || '',
    website_url: profile.website_url || ''
  })

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file)) 
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = profile.avatar_url

      // Upload Image Logic
      if (newAvatarFile) {
        const fileExt = newAvatarFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newAvatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        finalAvatarUrl = publicUrl
      }

      // Update Auth Metadata 
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          profession: formData.profession,
          bio: formData.bio,
          avatar_url: finalAvatarUrl
        }
      })
      if (authError) throw authError

      // 2. SAVE ALL FIELDS TO DATABASE
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id, 
          username: profile.username,
          full_name: formData.full_name,
          profession: formData.profession,
          bio: formData.bio,
          avatar_url: finalAvatarUrl,
          
          // Contact Info
          phone_number: formData.phone_number,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          
          // Social Links (using correct _url keys)
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          
          updated_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      setIsEditing(false)
      onUpdate() 
      alert("Profile updated successfully!")

    } catch (error: any) {
      console.error(error)
      alert("Error updating profile: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">My Profile</CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
             <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            {isEditing && (
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-8 h-8 text-white" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange} 
                />
              </div>
            )}
          </div>
          {isEditing && <p className="text-xs text-muted-foreground">Click image to change</p>}
        </div>

        {/* BASIC INFO SECTION */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              {isEditing ? (
                <Input 
                  value={formData.full_name} 
                  onChange={(e) => handleChange('full_name', e.target.value)} 
                />
              ) : (
                <p className="text-foreground font-semibold text-lg">{profile.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Profession / Title</label>
              {isEditing ? (
                <Input 
                  value={formData.profession} 
                  onChange={(e) => handleChange('profession', e.target.value)} 
                />
              ) : (
                <p className="text-foreground">{profile.profession}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">About Me</label>
            {isEditing ? (
              <Textarea 
                value={formData.bio} 
                rows={4}
                onChange={(e) => handleChange('bio', e.target.value)} 
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>

        {/* LOCATION SECTION (Added) */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-bold mb-4 text-slate-700 flex items-center gap-2">
             <MapPin className="w-4 h-4" /> Location Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-medium text-muted-foreground">Street Address</label>
               {isEditing ? (
                  <Input placeholder="123 Main St" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
               ) : (
                  <p className="text-sm">{profile.address || "Not added"}</p>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">City</label>
                  {isEditing ? (
                     <Input placeholder="New York" value={formData.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
                  ) : (
                     <p className="text-sm">{profile.city || "Not added"}</p>
                  )}
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">State</label>
                  {isEditing ? (
                     <Input placeholder="NY" value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} />
                  ) : (
                     <p className="text-sm">{profile.state || "Not added"}</p>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* SOCIAL LINKS SECTION */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-bold mb-4 text-slate-700">Contact & Social Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
              </div>
              {isEditing ? (
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone_number || ''}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.phone_number || "Not added"}</p>
              )}
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <label className="text-xs font-medium text-muted-foreground">Instagram URL</label>
              </div>
              {isEditing ? (
                <Input
                  placeholder="https://instagram.com/..."
                  value={formData.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                />
              ) : (
                <p className="text-sm truncate text-blue-600">{profile.instagram_url || "Not added"}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-medium text-muted-foreground">LinkedIn URL</label>
              </div>
              {isEditing ? (
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin_url || ''}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                />
              ) : (
                <p className="text-sm truncate text-blue-600">{profile.linkedin_url || "Not added"}</p>
              )}
            </div>

            
             
            
            {/* Website */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <label className="text-xs font-medium text-muted-foreground">Website / Portfolio</label>
              </div>
              {isEditing ? (
                <Input
                  placeholder="https://yourwebsite.com"
                  value={formData.website_url || ''}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                />
              ) : (
                <p className="text-sm truncate text-blue-600">{profile.website_url || "Not added"}</p>
              )}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}