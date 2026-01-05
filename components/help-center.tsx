import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-teal-900 py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">How can we help?</h1>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="h-12 pl-12 rounded-full bg-white text-slate-900 placeholder:text-slate-500" placeholder="Search for answers..." />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { title: "For Reviewers", desc: "How to write reviews, edit profile, and guidelines." },
            { title: "For Businesses", desc: "Claiming your profile, responding to reviews, and ads." },
            { title: "Account & Safety", desc: "Password reset, privacy settings, and reporting content." }
          ].map((item, i) => (
            <Card key={i} className="p-6 hover:shadow-lg transition-all cursor-pointer border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.desc}</p>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 space-y-8">
           <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
           <div className="space-y-4">
              {[
                "How do I edit my review?",
                "Is TrueTalkReviews free to use?",
                "How do you verify professionals?",
                "Can I delete my account?"
              ].map((q, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-teal-500 transition-colors">
                   <span className="font-medium text-slate-700">{q}</span>
                   <span className="text-teal-600">+</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}