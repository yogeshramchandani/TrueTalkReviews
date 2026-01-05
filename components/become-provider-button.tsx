"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button" // No need to import ButtonProps
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

// FIX: This line automatically gets all props (variant, size, className) from your Button component
type ButtonProps = React.ComponentProps<typeof Button>

interface Props extends ButtonProps {
  children?: React.ReactNode
}

export function BecomeProviderButton({ children, className, variant, size, ...props }: Props) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If an onClick was passed, run it (optional safety)
    if (props.onClick) {
      props.onClick(e)
    }

    if (user) {
      // LOGGED IN LOGIC
      if (user.user_metadata?.role === 'professional') {
        router.push("/service-provider-dashboard")
      } else {
        router.push("/auth/upgrade") // <--- This prevents the "Already Exists" error
      }
    } else {
      // LOGGED OUT LOGIC
      router.push("/auth/signup?role=professional")
    }
  }

  return (
    <Button 
      {...props} // Spread all other props first
      onClick={handleClick} // Our logic comes last to ensure it runs
      className={className} 
      variant={variant} 
      size={size}
    >
      {children || "For Professionals"}
    </Button>
  )
}