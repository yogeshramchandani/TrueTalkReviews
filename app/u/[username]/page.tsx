import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import PublicProfile from "@/components/public-profile"

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { username } = params

  // 1. Get the Current Logged In User (The Viewer)
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch Profile by Username (The Profile Owner)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return notFound()
  }

  // 3. Fetch Reviews for this Profile
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', profile.id)
    .order('created_at', { ascending: false })

  // 4. Pass 'user' (the viewer) to the component
  return <PublicProfile profile={profile} reviews={reviews || []} currentUser={user} />
}