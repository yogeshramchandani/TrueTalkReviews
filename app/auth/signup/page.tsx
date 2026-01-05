import { SignupForm } from "@/components/signup-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden py-10">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="flex items-center text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        <SignupForm />
        <p className="text-center text-xs text-slate-400 mt-8 mb-8">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}