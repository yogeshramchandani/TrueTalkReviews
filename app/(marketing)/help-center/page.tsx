import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Metadata } from "next"

// UNIQUE METADATA: Keeps your SEO strong and fixes the Bing duplicate error
export const metadata: Metadata = {
  title: "Help Center | TruVouch",
  description: "Need help using TruVouch? Browse our Help Center for step-by-step guides, FAQs, and tips on managing your verified professional profile and client reviews.",
}

// SEO-Optimized FAQ Data
const faqs = [
  {
    q: "How is a TruVouch verified review different from a personal website testimonial?",
    a: "Anyone can type a fake five-star testimonial onto their own personal website or PDF portfolio. Because you control the site, clients know those reviews carry very little weight. A TruVouch verified review is authenticated by a neutral third party. We ensure the client is real, giving independent professionals a true \"Trust Indicator\" that builds absolute confidence and helps close more deals."
  },
  {
    q: "Is TruVouch free for freelancers and independent professionals?",
    a: "Yes, creating a TruVouch profile and collecting verified client reviews is completely free for independent professionals, consultants, and solo experts. Whether you are a web developer, graphic designer, or astrologer, our mission is to make building a trusted, high-ranking online reputation accessible to everyone without upfront costs."
  },
  {
    q: "How does the client verification process actually work?",
    a: "When you complete a project and request a review, your client receives a secure, single-use link. We authenticate the client's identity before they can submit their feedback. This active verification prevents bots and bad actors from submitting fake feedback, ensuring your TruVouch profile remains a highly trusted destination for future clients."
  },
  {
    q: "How do I embed my TruVouch profile on my own website?",
    a: "Instead of relying on unverified website testimonials, you can use TruVouch as your definitive reputation layer. You can seamlessly link your unique truvouch.app/yourname profile to your Next.js portfolio, WordPress site, or social media bios. Adding this link to your \"Hire Me\" buttons instantly proves to visitors that your freelance reputation is third-party verified."
  }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section (ADDED pt-32 and md:pt-40 to push it below the navbar) */}
      <div className="bg-teal-900 pt-32 pb-24 md:pt-40 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">How can we help you build trust?</h1>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            className="h-12 pl-12 rounded-full bg-white text-slate-900 placeholder:text-slate-500" 
            placeholder="Search for guides, verification steps, or account settings..." 
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { title: "For Independent Professionals", desc: "Setting up your profile, importing past reviews, and sharing your TruVouch link." },
            { title: "For Clients (Reviewers)", desc: "How to securely verify your identity and leave an authentic review for a freelancer." },
            { title: "Trust & Verification", desc: "Understanding our verification process, reporting fake reviews, and platform safety." }
          ].map((item, i) => (
            <Card key={i} className="p-6 hover:shadow-lg transition-all cursor-pointer border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* YOUTUBE VIDEO EMBED */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">See How TruVouch Works</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Watch our quick overview to see how independent professionals are using TruVouch to build absolute confidence with their clients.
          </p>
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
            {/* REPLACE THIS URL WITH YOUR ACTUAL YOUTUBE EMBED LINK */}
            <iframe
              className="w-full h-[250px] sm:h-[400px] md:h-[500px]"
              src="https://www.youtube.com/embed/bVVJjoULXEA?si=gTxA5B18XMVKjgOs" 
              title="TruVouch Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* INTERACTIVE FAQs (SEO Safe via <details> tag) */}
        <div className="max-w-3xl mx-auto mt-20 space-y-8">
           <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white border border-slate-200 rounded-lg open:shadow-md transition-all">
                  <summary className="p-5 flex justify-between items-center cursor-pointer list-none outline-none [&::-webkit-details-marker]:hidden">
                    <span className="font-medium text-slate-800">{faq.q}</span>
                    {/* The plus sign rotates to an 'x' when opened */}
                    <span className="text-teal-600 font-bold text-2xl leading-none group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-1">
                    {faq.a}
                  </div>
                </details>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}