"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Users, Briefcase, MessageSquare, DollarSign, ShieldAlert, Mail, Clock, MapPin, CheckCircle2, XCircle } from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from "sonner"
import { Button } from "@/components/ui/button";

// --- THEME COLORS ---
const TEAL_MAIN = '#0D9488';
const TEAL_LIGHT = '#CCFBF1';
const SLATE_LIGHT = '#E2E8F0'; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, professionals: 0, reviews: 0, activeDisputes: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [disputedReviews, setDisputedReviews] = useState<any[]>([])

  useEffect(() => {
    async function loadRealData() {
      // 1. Fetch Basic Counts
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: proCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional')
      const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
      
      // Fetch Disputes
      const { data: disputes, count: disputeCount } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'disputed')
        .order('created_at', { ascending: false })

      setDisputedReviews(disputes || [])
      setStats({
        totalUsers: userCount || 0,
        professionals: proCount || 0,
        reviews: reviewCount || 0,
        activeDisputes: disputeCount || 0
      })

      // 2. Chart Logic (Existing)
      const { data: allProfiles } = await supabase.from('profiles').select('created_at')
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const currentMonthIndex = new Date().getMonth()
      const monthlyCounts = new Array(currentMonthIndex + 1).fill(0)

      if (allProfiles) {
        allProfiles.forEach(p => {
          const date = new Date(p.created_at)
          if (date.getFullYear() === new Date().getFullYear()) {
             const mIndex = date.getMonth()
             if (mIndex <= currentMonthIndex) monthlyCounts[mIndex]++
          }
        })
      }

      setChartData(monthlyCounts.map((count, i) => ({ name: months[i], value: count })))

      // 3. Process Pie Data
      const { count: verifiedCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional').eq('is_verified', true)
      const { count: pendingCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional').eq('is_verified', false)
      
      setPieData([
        { name: 'Verified', value: verifiedCount || 0 },
        { name: 'Pending', value: pendingCount || 0 }
      ])
    }
    loadRealData()
  }, [])

  return (
    <div className="space-y-8 pb-20 px-4">
        
        {/* 1. TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PixelCard title="Total Users" value={stats.totalUsers} icon={Users} trend="+Live" trendUp={true} />
            <PixelCard title="Professionals" value={stats.professionals} icon={Briefcase} trend="Active" trendUp={true} />
            <PixelCard title="Total Reviews" value={stats.reviews} icon={MessageSquare} trend="Verified" trendUp={true} />
            <PixelCard title="Active Disputes" value={stats.activeDisputes} icon={ShieldAlert} trend="Attention" trendUp={false} isAlert={stats.activeDisputes > 0}/>
        </div>

        {/* 2. DISPUTE MANAGEMENT SECTION (NEW) */}
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <ShieldAlert className="text-red-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-slate-800">Review Disputes</h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {disputedReviews.length === 0 ? (
                    <div className="col-span-full py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-medium">
                        No active disputes found in the system.
                    </div>
                ) : (
                    disputedReviews.map(review => (
                        <AdminDisputeCard key={review.id} review={review} />
                    ))
                )}
            </div>
        </section>

        {/* 3. CHARTS ROW (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 flex flex-col">
               <h3 className="text-xl font-bold text-slate-800 mb-8 ml-2">User Growth</h3>
               <div className="h-[300px] w-full mt-auto">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TEAL_MAIN} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={TEAL_MAIN} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }} />
                      <Area type="monotone" dataKey="value" stroke={TEAL_MAIN} strokeWidth={3} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 flex flex-col items-center">
               <h3 className="text-lg font-bold text-slate-800 mb-6 w-full text-left ml-2">Verification Status</h3>
               <div className="h-[200px] w-full relative flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? TEAL_MAIN : SLATE_LIGHT} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-slate-800">
                        {stats.professionals > 0 ? Math.round((pieData[0]?.value / stats.professionals) * 100) : 0}%
                     </span>
                  </div>
               </div>
               <div className="mt-8 space-y-3 w-full">
                  <PieRow label="Verified Pros" color="bg-teal-600" value={pieData[0]?.value} />
                  <PieRow label="Pending" color="bg-slate-200" value={pieData[1]?.value} />
               </div>
            </div>
        </div>
    </div>
  )
}

/** * DISPUTE CARD COMPONENT
 */
function AdminDisputeCard({ review }: { review: any }) {
  const [timeLeft, setTimeLeft] = useState<string>("Calculated after email sent")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!review.dispute_notified_at) return
    const interval = setInterval(() => {
      const deadline = new Date(review.dispute_notified_at).getTime() + (48 * 60 * 60 * 1000)
      const diff = deadline - new Date().getTime()

      if (diff <= 0) {
        setTimeLeft("EXPIRED")
        clearInterval(interval)
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours}h ${mins}m remaining`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [review.dispute_notified_at])

  const sendProofRequest = async () => {
    setIsSubmitting(true)
    const res = await fetch('/api/admin/request-proof', {
      method: 'POST',
      body: JSON.stringify({ reviewId: review.id, reviewerEmail: review.reviewer_email })
    })
    if (res.ok) toast.success("Proof request email sent.")
    setIsSubmitting(false)
  }

  const resolveDispute = async (isValid: boolean) => {
    setIsSubmitting(true)
    const res = await fetch('/api/admin/resolve-dispute', {
      method: 'POST',
      body: JSON.stringify({ reviewId: review.id, isValid, reviewerId: review.reviewer_id, providerId: review.provider_id })
    })
    if (res.ok) toast.success(isValid ? "Strike applied to Professional." : "Strike applied to Reviewer.")
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Case ID: {review.id.slice(0, 8)}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{review.dispute_status || 'Needs Evidence'}</p>
                </div>
            </div>
            {review.dispute_notified_at && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">{timeLeft}</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-50">
            <EntityInfo label="Reviewer (Plaintiff)" name={review.reviewer_name} id={review.reviewer_id} location={review.reviewer_location} />
            <EntityInfo label="Professional (Defendant)" name={review.provider_name} id={review.provider_id} location={review.provider_location} />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl italic text-sm text-slate-600">"{review.content}"</div>

        <div className="flex flex-wrap gap-3 mt-2">
            {!review.dispute_notified_at ? (
                <Button onClick={sendProofRequest} disabled={isSubmitting} className="bg-teal-700 hover:bg-teal-800 rounded-xl gap-2 font-bold h-11 px-6">
                   <Mail className="w-4 h-4" /> Request Proof
                </Button>
            ) : (
                <>
                   {review.dispute_proof_url ? (
                     <div className="flex w-full gap-3">
                        <Button onClick={() => window.open(review.dispute_proof_url)} variant="outline" className="flex-1 rounded-xl h-11 border-slate-200">View Proof</Button>
                        <Button onClick={() => resolveDispute(true)} className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl h-11"><CheckCircle2 className="w-4 h-4 mr-2"/> Approve</Button>
                        <Button onClick={() => resolveDispute(false)} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11"><XCircle className="w-4 h-4 mr-2"/> Reject</Button>
                     </div>
                   ) : (
                     <p className="text-sm font-medium text-slate-400">Waiting for reviewer to upload files...</p>
                   )}
                </>
            )}
        </div>
    </div>
  )
}

function EntityInfo({ label, name, id, location }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="text-[10px] font-mono text-slate-400">UID: {id.slice(0, 8)}</p>
            <p className="text-[11px] text-teal-600 flex items-center gap-1 font-medium"><MapPin className="w-3 h-3" /> {location || 'Unknown'}</p>
        </div>
    )
}

function PixelCard({ title, value, icon: Icon, trend, trendUp, isAlert }: any) {
  return (
    <div className={`bg-white p-5 rounded-[32px] shadow-sm flex flex-col justify-between h-[140px] border transition-all ${isAlert ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-50 hover:shadow-md'}`}>
       <div className="flex justify-between items-start">
          <div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{title}</p>
             <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">{value}</h3>
          </div>
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isAlert ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-teal-600'}`}>
             <Icon className="w-6 h-6" />
          </div>
       </div>
       <div className="flex items-center gap-2 mt-auto">
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg tracking-widest uppercase ${trendUp ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
             {trend}
          </span>
       </div>
    </div>
  )
}

function PieRow({ label, color, value }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">{label}</span>
            </div>
            <span className="text-sm font-black text-slate-800">{value || 0}</span>
        </div>
    )
}