import { Suspense } from "react"
import SignupForm  from "@/components/signup-form"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}