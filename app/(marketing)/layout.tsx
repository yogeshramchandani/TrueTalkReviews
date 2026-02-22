import { createClient } from "@/utils/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <>
      <Navbar user={user} profile={profile} />
      {children}
      <Footer />
    </>
  )
}