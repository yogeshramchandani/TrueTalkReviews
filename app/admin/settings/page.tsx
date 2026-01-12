"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Tag } from "lucide-react"

export default function AdminSettings() {
  // Mock State for Categories
  const [categories, setCategories] = useState([
    "Vedic Astrology", "Tarot Reading", "Numerology", "Palmistry", "Vastu"
  ])
  const [newCat, setNewCat] = useState("")

  const addCategory = () => {
    if (!newCat) return
    setCategories([...categories, newCat])
    setNewCat("")
  }

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat))
  }

  return (
    <div className="space-y-6">
       <div>
          <div className="text-sm text-slate-400 mb-1">Home › Dashboard › <span className="text-slate-600">Settings</span></div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CATEGORIES CARD */}
          <Card className="border-slate-200 shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <Tag className="w-5 h-5 text-teal-600" /> Service Categories
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex gap-2">
                   <Input 
                     placeholder="Add new category..." 
                     value={newCat}
                     onChange={(e) => setNewCat(e.target.value)}
                   />
                   <Button onClick={addCategory} className="bg-teal-700 hover:bg-teal-800">
                      <Plus className="w-4 h-4" />
                   </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                   {categories.map(cat => (
                      <div key={cat} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-slate-200">
                         {cat}
                         <button onClick={() => removeCategory(cat)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                   ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                   These categories will appear in the "Explore" filters.
                </p>
             </CardContent>
          </Card>

          {/* ADMINS CARD (Read Only) */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
             <CardHeader>
                <CardTitle className="text-lg font-bold">Admin Accounts</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                   Admin roles can currently only be assigned via the "Users" tab or directly in the database for security reasons.
                </p>
                <Button variant="outline" disabled>Manage Admins</Button>
             </CardContent>
          </Card>

       </div>
    </div>
  )
}