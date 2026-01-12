"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Users, Briefcase, MessageSquare, DollarSign } from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- THEME COLORS ---
const TEAL_MAIN = '#0D9488'; // teal-600
const TEAL_LIGHT = '#CCFBF1'; // teal-100
const SLATE_LIGHT = '#E2E8F0'; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, professionals: 0, reviews: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])

  useEffect(() => {
    async function loadRealData() {
      // 1. Fetch Basic Counts
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: proCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional')
      const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: userCount || 0,
        professionals: proCount || 0,
        reviews: reviewCount || 0
      })

      // 2. FIXED CHART LOGIC: Smart Date Handling
      const { data: allProfiles } = await supabase.from('profiles').select('created_at')
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const currentMonthIndex = new Date().getMonth() // 0 for Jan, 1 for Feb...
      
      // Initialize counts ONLY up to the current month
      const monthlyCounts = new Array(currentMonthIndex + 1).fill(0)

      if (allProfiles) {
        allProfiles.forEach(p => {
          const date = new Date(p.created_at)
          // Only count users from the current year
          if (date.getFullYear() === new Date().getFullYear()) {
             const mIndex = date.getMonth()
             // Safety check: ensure we don't count future months if system time is off
             if (mIndex <= currentMonthIndex) {
                 monthlyCounts[mIndex]++
             }
          }
        })
      }

      // Format data for the chart
      let formattedData = monthlyCounts.map((count, i) => ({
         name: months[i],
         value: count
      }))

      // VISUAL FIX: If we only have 1 month of data (e.g. just Jan), 
      // the chart looks like a single dot. Add a fake "Start" point 
      // so it draws a nice upward slope line.
      if (formattedData.length === 1) {
          formattedData.unshift({ name: 'Start', value: 0 })
      }

      setChartData(formattedData)

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
    <div className="space-y-6">
        
        {/* 1. TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PixelCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={Users} 
              trend="+Live" 
              trendUp={true} 
            />
            <PixelCard 
              title="Professionals" 
              value={stats.professionals} 
              icon={Briefcase} 
              trend="Active" 
              trendUp={true} 
            />
            <PixelCard 
              title="Total Reviews" 
              value={stats.reviews} 
              icon={MessageSquare} 
              trend="Verified" 
              trendUp={true} 
            />
            <PixelCard 
              title="Revenue" 
              value="Free" 
              icon={DollarSign} 
              trend="Beta" 
              trendUp={true} 
            />
        </div>

        {/* 2. CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MAIN AREA CHART */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[20px] shadow-sm shadow-slate-100 border border-slate-50 flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">User Growth</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      New signups (Year to Date)
                    </p>
                  </div>
               </div>
               
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
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94A3B8', fontSize: 12}} 
                        dy={10} 
                        // Only show ticks for real data points to avoid clutter
                        interval={0}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94A3B8', fontSize: 12}} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: TEAL_MAIN, strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={TEAL_MAIN} 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* DONUT CHART */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm shadow-slate-100 border border-slate-50 flex flex-col">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Verification Status</h3>
               <div className="h-[200px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? TEAL_MAIN : SLATE_LIGHT} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-slate-800">
                        {stats.professionals > 0 
                           ? Math.round(((pieData[0]?.value || 0) / stats.professionals) * 100) 
                           : 0}%
                     </span>
                     <span className="text-xs text-slate-400">Verified</span>
                  </div>
               </div>
               
               <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                        <span className="text-sm font-medium text-slate-600">Verified Pros</span>
                     </div>
                     <span className="text-sm font-bold text-slate-800">{pieData[0]?.value || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <span className="text-sm font-medium text-slate-600">Pending</span>
                     </div>
                     <span className="text-sm font-bold text-slate-800">{pieData[1]?.value || 0}</span>
                  </div>
               </div>
            </div>
        </div>
    </div>
  )
}

function PixelCard({ title, value, icon: Icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-5 rounded-[20px] shadow-sm shadow-slate-100 flex flex-col justify-between h-[140px] relative overflow-hidden group hover:shadow-md transition-all border border-slate-50">
       <div className="flex justify-between items-start">
          <div className="z-10">
             <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
             <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#F4F7FE] flex items-center justify-center group-hover:bg-teal-50 transition-colors">
             <Icon className="w-6 h-6 text-teal-600" />
          </div>
       </div>
       
       <div className="flex items-center gap-2 mt-auto">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>
             {trend}
          </span>
       </div>
    </div>
  )
}