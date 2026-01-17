  import { notFound } from "next/navigation"
  import { createClient } from "@/utils/supabase/server"
  import PublicProfile from "@/components/public-profile"
  import { Metadata, ResolvingMetadata } from 'next'
  import Script from 'next/script'

  export const dynamic = 'force-dynamic'

  // --- 1. SEO: Dynamic Title & Description ---
  type Props = {
    params: { username: string }
  }

  export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    const supabase = createClient()
    const { username } = params

    // [FIX ADDED]: Stop the crash if username is missing or null
    if (!username || username === 'null' || username === 'undefined') {
      return {
        title: 'Professional Profile | TruVouch',
      }
    }

    // Fetch just the basic info needed for SEO tags
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, profession, bio, avatar_url')
      .eq('username', username)
      .single()

    if (!profile) {
      return {
        title: 'Profile Not Found | TruVouch',
      }
    }

    // Dynamic Title: "Yogesh - Android Developer Reviews | TruVouch"
    const title = `${profile.full_name} - ${profile.profession || 'Professional'} Reviews | TruVouch`
    
    // Dynamic Description: Uses their bio or a default string
    const description = profile.bio 
      ? profile.bio.slice(0, 160) 
      : `Read verified reviews and check the reputation of ${profile.full_name} on TruVouch.`

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [profile.avatar_url || '/default-avatar.png'], 
      },
    }
  }

  // --- 2. Main Page Component ---
  export default async function PublicProfilePage({ params }: Props) {
    const supabase = createClient()
    const { username } = params

    // [FIX ADDED]: Safety check for the main page too
    if (!username || username === 'null') {
      return notFound()
    }

    // A. Get the Current Logged In User (The Viewer)
    const { data: { user } } = await supabase.auth.getUser()

    // B. Fetch Profile by Username (The Profile Owner)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('role', 'professional')
      .single()

    if (!profile) {
      return <div>User not found or is not a business account.</div>
    }

    // C. Fetch Reviews for this Profile
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', profile.id)
      .order('created_at', { ascending: false })

    const reviewList = reviews || []

    // --- 3. SEO: Calculate Rating for Google Stars ---
    // We calculate the real average from the reviews fetched above
    const reviewCount = reviewList.length
    const totalRating = reviewList.reduce((sum, review) => sum + (review.rating || 0), 0)
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "5.0"

    // Construct the JSON-LD Schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.full_name,
      "jobTitle": profile.profession,
      "image": profile.avatar_url,
      "description": profile.bio,
      "url": `https://truvouch.com/u/${profile.username}`, 
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating,
        "reviewCount": reviewCount > 0 ? reviewCount : "1", // Fallback to 1 so schema doesn't break if empty
        "bestRating": "5",
        "worstRating": "1"
      }
    }

    // D. Pass data to the component & Inject Schema
    return (
      <>
        {/* Inject Structured Data for Google Stars */}
        <Script
          id="profile-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <PublicProfile 
          profile={profile} 
          reviews={reviewList} 
          currentUser={user} 
        />
      </>
    )
  }