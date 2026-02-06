export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Community Guidelines</h1>
        <p className="text-slate-500 text-lg mb-12">Building a community of trust.</p>

        <div className="prose prose-slate max-w-none">
           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">Be Helpful and Relevant</h2>
             <p className="text-slate-600 mb-4">
               The best reviews describe the "why". Instead of just saying "Great service", explain what the professional did well. This helps others make informed decisions.
             </p>
           </section>

           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">Stay Civil</h2>
             <p className="text-slate-600 mb-4">
               Disagreements happen. If you had a bad experience, describe it factually and calmly. Personal attacks and swearing reduce the credibility of your review.
             </p>
           </section>

           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">Keep it Real</h2>
             <p className="text-slate-600 mb-4">
               Write about your own experience. Do not write reviews on behalf of friends or family members.
             </p>
           </section>
        </div>
      </div>
    </div>
  )
}