import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Plus_Jakarta_Sans } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"

import { createClient } from "@/utils/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://truvouch.app"),
  title: "TruVouch - Build Trust with Real Reviews",
  description:
    "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
  openGraph: {
    title: "TruVouch - Build Trust with Real Reviews",
    description:
      "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
    siteName: "TruVouch",
    images: [{ url: "/logo.png", width: 800, height: 600 }],
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "w7j0_4eU2EoKi6B-Bdk6Iccmj_3vpgF--8AD3t4saa4",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        
        {children}
        
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-7WPX0GQ29B" />
    </html>
  )
}
