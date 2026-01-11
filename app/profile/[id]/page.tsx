import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server" // Ensure you have this helper
import { Star, MapPin, ShieldCheck, Phone, Globe, Instagram, Linkedin } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ProfileHeader from "@/components/profile-header"
import ReviewsList from "@/components/reviews-list"
import { WriteReviewDialog } from "@/components/write-review-dialog" 
import ShareProfileButton from "@/components/share-profile-button"

// Force dynamic rendering so we always get the latest data
export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // 1. GET THE PROFILE (Real Data)
  // We use .single() - if no row exists (e.g. it's a reviewer), this will error/return null
  const { data: provider, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  // 2. IF NOT FOUND (e.g. Reviewer ID), SHOW 404
  if (error || !provider) {
    return notFound()
  }

  // 3. GET REVIEWS
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })

  // 4. CALCULATE STATS
  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0"

  // 5. GET SOCIAL LINKS (Safe Filter)
  const socialLinks = [
    { icon: Globe, url: provider.website_url, color: "text-teal-600" },
    { icon: Instagram, url: provider.instagram_url, color: "text-pink-600" },
    { icon: Linkedin, url: provider.linkedin_url, color: "text-blue-700" }
  ].filter(link => link.url)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <ProfileHeader provider={provider} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* LEFT COLUMN (Main Info) */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-50">
                <h2 className="text-xl font-bold text-slate-900">About</h2>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed text-lg">
                  {provider.bio || "This professional hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Reviews</h2>
                  <p className="text-slate-500 text-sm">
                    {totalReviews} verified client reviews
                  </p>
                </div>
                <WriteReviewDialog 
                  providerId={provider.id} 
                  providerName={provider.full_name} 
                />
              </div>
              <ReviewsList reviews={reviews || []} />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card className="sticky top-24 border-slate-200 shadow-md">
              <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Rating & Reviews</h3>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">{averageRating}</span>
                    <span className="text-slate-400 font-medium">/5</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(Number(averageRating)) ? "fill-orange-400 text-orange-400" : "fill-slate-100 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{totalReviews} ratings</span>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <WriteReviewDialog 
                     providerId={provider.id} 
                     providerName={provider.full_name} 
                  />
                  <ShareProfileButton provider={provider} />
                </div>
              </CardContent>
            </Card>

            {/* Verified Details Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" /> Verified Info
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                     <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="font-bold text-slate-700">Location</p>
                     <p className="text-slate-600">{provider.city || "Remote"}</p>
                  </div>
                </div>

                {/* Phone (Optional) */}
                {provider.phone_number && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                       <Phone className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="font-bold text-slate-700">Phone Verified</p>
                       <p className="text-slate-600">{provider.phone_number}</p>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                   <div className="pt-4 mt-2 border-t border-slate-100 flex gap-2">
                      {socialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" className={`p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors ${link.color}`}>
                           <link.icon className="w-4 h-4" />
                        </a>
                      ))}
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}