export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Safety Guidelines</h1>
        <p className="text-slate-500 text-lg mb-12">Updated January 2026</p>

        <div className="prose prose-slate max-w-none">
           <p className="lead text-xl text-slate-700 mb-8">
             TruVouch is committed to being a safe platform for honest feedback. Our guidelines help ensure a trusted environment for everyone.
           </p>

           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">1. Respect Privacy</h2>
             <p className="text-slate-600 mb-4">
               Do not post private information about individuals, such as personal phone numbers, addresses, or medical records. Stick to professional experiences.
             </p>
           </section>

           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">2. Zero Tolerance for Hate Speech</h2>
             <p className="text-slate-600 mb-4">
               We do not tolerate reviews that attack people based on race, religion, gender, or orientation. Such content will be removed immediately and accounts may be banned.
             </p>
           </section>

           <section className="mb-10">
             <h2 className="text-2xl font-bold text-teal-900 mb-4">3. Honest Representation</h2>
             <p className="text-slate-600 mb-4">
               Reviews must be based on real interactions. Competitors cannot review each other, and businesses cannot review themselves.
             </p>
           </section>
        </div>
      </div>
    </div>
  )
}