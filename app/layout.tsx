import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Alata } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'// Initialize the font
const inter = Inter({ subsets: ["latin"], display: 'swap', })
const alata = Alata({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alata", // We give it a variable name to use in Tailwind
});
export const metadata: Metadata = {
  // 1. Browser Tab Title
  metadataBase: new URL('https://www.truvouch.app'),
  title: "TruVouch - Build Trust with Real Reviews",
  
  // 2. Search Engine Description
  description: "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
  
  // 3. WhatsApp / Facebook / LinkedIn Preview Card
  openGraph: {
    title: "TruVouch - Build Trust with Real Reviews",
    description: "Create a public profile and let real clients vouch for your services. Grow your business with authentic reviews.",
    siteName: "TruVouch",
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
      <body className={`${alata.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        
      </body>
      <GoogleAnalytics gaId="G-7WPX0GQ29B" />
    </html>
  )
}