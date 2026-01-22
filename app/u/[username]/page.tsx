import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import PublicProfile from "@/components/public-profile"
import StructuredData from "@/components/structured-data" // 👈 The new component
import { Metadata, ResolvingMetadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: { username: string }
}

// --- 1. SEO: Dynamic Title & Description ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createClient()
  const { username } = params

  if (!username || username === 'null') {
    return { title: 'Professional Profile | TruVouch' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, profession, bio, city, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return { title: 'Profile Not Found | TruVouch' }
  }
const locationString = profile.city ? ` in ${profile.city}` : ""
  const title = `${profile.full_name}${locationString} - Verified ${profile.profession || 'Professional'} | TruVouch`
  const description = profile.bio 
    ? profile.bio.slice(0, 160) 
    : `Contact ${profile.full_name}, a professional ${profile.profession || 'expert'}${locationString}. Read verified reviews, check ratings, and view their verified portfolio on TruVouch.`

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [profile.avatar_url || '/default-avatar.png'], 
      type: 'profile',
    },
  }
}

// --- 2. Main Page Component ---
export default async function PublicProfilePage({ params }: Props) {
  const supabase = createClient()
  const { username } = params

  if (!username || username === 'null') return notFound()

  // A. Get Viewer
  const { data: { user } } = await supabase.auth.getUser()

  // B. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('role', 'professional')
    .single()

  if (!profile) {
    return <div className="text-center py-20 text-slate-500">User not found or is not a business account.</div>
  }

  // C. Fetch Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', profile.id)
    .order('created_at', { ascending: false })

  const reviewList = reviews || []

  return (
    <main>
      {/* 👇 CLEAN & POWERFUL SEO COMPONENT 👇 */}
      <StructuredData profile={profile} reviews={reviewList} />

      {/* Main UI */}
      <PublicProfile 
        profile={profile} 
        reviews={reviewList} 
        currentUser={user} 
      />
    </main>
  )
}