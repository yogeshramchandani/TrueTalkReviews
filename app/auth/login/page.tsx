import LoginForm  from "@/components/login-form"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"  

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}