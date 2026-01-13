import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Login Failed</h1>
        <p className="text-slate-500 mb-6">
          We encountered an issue verifying your Google account. This usually happens if the connection was interrupted.
        </p>
        <Link 
          href="/auth/signup" 
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}