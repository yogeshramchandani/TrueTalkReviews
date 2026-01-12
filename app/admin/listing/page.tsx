"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, ShieldCheck, Ban, CheckCircle2, XCircle } from "lucide-react"

export default function AdminListings() {
  const [pros, setPros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPros()
  }, [])

  async function fetchPros() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professional')
      .order('created_at', { ascending: false })
    
    if (data) setPros(data)
    setLoading(false)
  }

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    // Optimistic UI Update
    setPros(pros.map(p => p.id === id ? { ...p, is_verified: !currentStatus } : p))
    
    await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <div className="text-sm text-slate-400 mb-1">Home › Dashboard › <span className="text-slate-600">Listings</span></div>
            <h1 className="text-2xl font-bold text-slate-900">Professional Listings</h1>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Professional</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-teal-600"/></TableCell></TableRow>
            ) : pros.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">No professionals found.</TableCell></TableRow>
            ) : (
              pros.map((pro) => (
                <TableRow key={pro.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={pro.avatar_url} />
                        <AvatarFallback>{pro.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                           {pro.full_name} 
                           {pro.is_verified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                        <div className="text-xs text-teal-600 font-medium">{pro.profession || "No Title"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {pro.city ? `${pro.city}, ${pro.state}` : <span className="italic text-slate-300">Not set</span>}
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Live</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant={pro.is_verified ? "outline" : "default"}
                      className={pro.is_verified ? "border-red-200 text-red-600 hover:bg-red-50" : "bg-blue-600 hover:bg-blue-700 text-white"}
                      onClick={() => toggleVerification(pro.id, pro.is_verified)}
                    >
                      {pro.is_verified ? (
                         <><XCircle className="w-4 h-4 mr-2" /> Revoke Badge</>
                      ) : (
                         <><CheckCircle2 className="w-4 h-4 mr-2" /> Verify Account</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}