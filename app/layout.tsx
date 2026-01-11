import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { GoogleAnalytics } from '@next/third-parties/google'// Initialize the font
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // 1. Browser Tab Title
  title: "TrueTalk Reviews - Build Trust with Real Reviews",
  
  // 2. Search Engine Description
  description: "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
  
  // 3. WhatsApp / Facebook / LinkedIn Preview Card
  openGraph: {
    title: "TrueTalk Reviews - Build Trust with Real Reviews",
    description: "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
    siteName: "TrueTalk Reviews",
    images: [
      {
        url: "/logo.png", // This uses your logo for the link preview image
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },

  // 4. Browser Tab Icon (Favicon)
  // Assuming 'logo.png' is in your public folder
  icons: {
    icon: "/logo.png", 
    shortcut: "/logo.png",
    apple: "/logo.png", // Used for iPhone home screen shortcuts
  },

  verification:{
    google: "w7j0_4eU2EoKi6B-Bdk6Iccmj_3vpgF--8AD3t4saa4"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <Analytics />
        <GoogleAnalytics gaId="G-Q8T32X0ER6" />
      </body>
    </html>
  )
}