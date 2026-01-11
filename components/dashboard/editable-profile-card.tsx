"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Edit2, Save, X, Camera, User, Phone, Instagram, Linkedin, Globe, MapPin } from "lucide-react"

// 0. CUSTOM REDDIT ICON (Updated with Official SVG)
const RedditIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M16 2C8.27812 2 2 8.27812 2 16C2 23.7219 8.27812 30 16 30C23.7219 30 30 23.7219 30 16C30 8.27812 23.7219 2 16 2Z" fill="#FC471E"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z" fill="white"/>
  </svg>
)

// 1. UPDATE INTERFACE
interface ProfileData {
  id: string
  username: string
  full_name: string
  profession: string
  bio: string
  avatar_url: string | null
  phone_number?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  website_url?: string | null
  reddit_url?: string | null
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

  // 2. INITIALIZE FORM DATA WITH REDDIT URL
  const [formData, setFormData] = useState({
    ...profile,
    phone_number: profile.phone_number || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    instagram_url: profile.instagram_url || '',
    linkedin_url: profile.linkedin_url || '',
    website_url: profile.website_url || '',
    reddit_url: profile.reddit_url || ''
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

      // 3. SAVE TO DATABASE (Including Reddit URL)
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
          
          // Social Links
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          reddit_url: formData.reddit_url,
          
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

        {/* LOCATION SECTION */}
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
            
             {/* 4. REDDIT LINK INPUT */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* No text color class needed here since SVG handles its own brand colors */}
                <RedditIcon className="w-4 h-4" />
                <label className="text-xs font-medium text-muted-foreground">Reddit Profile</label>
              </div>
              {isEditing ? (
                <Input
                  placeholder="https://reddit.com/user/..."
                  value={formData.reddit_url || ''}
                  onChange={(e) => handleChange('reddit_url', e.target.value)}
                />
              ) : (
                <p className="text-sm truncate text-blue-600">{profile.reddit_url || "Not added"}</p>
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