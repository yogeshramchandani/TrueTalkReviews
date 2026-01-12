"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Trash2, Loader2, ShieldAlert, User, Briefcase, 
  MoreHorizontal, X, Save, Filter
} from "lucide-react"

// --- TYPES ---
type Profile = {
  id: string
  username: string
  full_name: string
  email: string
  role: 'admin' | 'professional' | 'reviewer'
  avatar_url: string | null
  profession?: string
  bio?: string
  city?: string
  state?: string
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<'all' | 'professional' | 'reviewer'>('all')
  
  // Drawer State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // --- 1. FETCH USERS ---
  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  // --- 2. FILTER LOGIC ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    
    const matchesTab = activeTab === 'all' ? true : user.role === activeTab

    return matchesSearch && matchesTab
  })

  // --- 3. OPEN DRAWER ---
  const handleEditClick = (user: Profile) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  // --- 4. UPDATE USER ---
  const handleUpdateUser = (updatedUser: Profile) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
    setIsDrawerOpen(false)
  }

  // --- 5. DELETE USER (Server API) ---
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("⚠️ PERMANENT ACTION\n\nAre you sure? This will completely wipe their account, login, and data.")) return;
    
    // Optimistic Update
    setUsers(users.filter(u => u.id !== userId))
    setIsDrawerOpen(false)

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete")
      }
      alert("User deleted permanently.")
    } catch (error: any) {
      alert("Error deleting user: " + error.message)
      fetchUsers() 
    }
  }

  return (
    <div className="space-y-6 relative min-h-screen">
      
      {/* HEADER & TABS */}
      <div>
         <div className="text-sm text-slate-400 mb-2 font-medium">
           Home <span className="mx-2">›</span> Users
         </div>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
               {['all', 'professional', 'reviewer'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                      activeTab === tab 
                        ? 'bg-purple-50 text-purple-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {tab}s
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Search users..." 
             className="pl-10 bg-white border-slate-200"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
        <Button variant="outline" className="bg-white border-slate-200 text-slate-600">
           <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-500">User Profile</TableHead>
              <TableHead className="font-semibold text-slate-500">Role</TableHead>
              <TableHead className="font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-500">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No users found matching filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-50 hover:bg-purple-50/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-slate-100 bg-white">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{user.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900">{user.full_name}</div>
                        <div className="text-xs text-slate-500">@{user.username}</div>
                        {user.profession && <div className="text-xs text-purple-600 font-medium mt-0.5">{user.profession}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                        px-2.5 py-0.5 shadow-none font-medium
                        ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                        ${user.role === 'professional' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                        ${user.role === 'reviewer' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                    `}>
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
                      Active
                    </div>
                    {/* 👇 ADDED THIS BACK: The "Joined Date" */}
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={() => handleEditClick(user)}
                       className="text-slate-400 hover:text-purple-700 hover:bg-purple-50 font-medium"
                    >
                       Manage <MoreHorizontal className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DRAWER */}
      {isDrawerOpen && selectedUser && (
        <EditUserDrawer 
           user={selectedUser} 
           onClose={() => setIsDrawerOpen(false)} 
           onUpdate={handleUpdateUser}
           onDelete={handleDeleteUser}
        />
      )}
    </div>
  )
}

function EditUserDrawer({ user, onClose, onUpdate, onDelete }: { 
  user: Profile, 
  onClose: () => void, 
  onUpdate: (u: Profile) => void,
  onDelete: (id: string) => void
}) {
  const [formData, setFormData] = useState(user)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
         full_name: formData.full_name,
         role: formData.role,
         profession: formData.profession,
         bio: formData.bio,
         city: formData.city,
         state: formData.state
      })
      .eq('id', user.id)

    setIsSaving(false)
    if (error) alert("Error: " + error.message)
    else onUpdate(formData)
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[70] border-l border-slate-100 flex flex-col animate-in slide-in-from-right-10 duration-300">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
           <div>
             <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
             <p className="text-xs text-slate-400 font-mono mt-1">{user.id}</p>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <User className="w-3 h-3" /> Identity
               </h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-medium text-slate-700 mb-1.5 block">Full Name</label>
                     <Input 
                        value={formData.full_name} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                        className="bg-white border-slate-200"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Username</label>
                        <Input value={user.username} disabled className="bg-slate-50 text-slate-500 border-slate-100" />
                     </div>
                     <div>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Email</label>
                        <Input value={user.email || "-"} disabled className="bg-slate-50 text-slate-500 border-slate-100" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
               <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                 <ShieldAlert className="w-3 h-3" /> Role & Access
               </h3>
               <select 
                 className="w-full h-10 px-3 rounded-lg border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700"
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value as any})}
               >
                  <option value="reviewer">Reviewer</option>
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
               </select>
               <p className="text-[11px] text-purple-600/70 leading-tight">
                  "Professional" grants dashboard access. "Admin" grants full control.
               </p>
            </div>

            {formData.role === 'professional' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mt-4">
                   <Briefcase className="w-3 h-3" /> Professional Details
                 </h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-medium text-slate-700 mb-1.5 block">Job Title</label>
                       <Input 
                          value={formData.profession || ""} 
                          onChange={e => setFormData({...formData, profession: e.target.value})} 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-medium text-slate-700 mb-1.5 block">City</label>
                           <Input value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                           <label className="text-xs font-medium text-slate-700 mb-1.5 block">State</label>
                           <Input value={formData.state || ""} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="pt-8 mt-4 border-t border-slate-100">
               <Button 
                 variant="ghost" 
                 className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 justify-start px-0"
                 onClick={() => onDelete(user.id)}
               >
                 <Trash2 className="w-4 h-4 mr-2" /> Delete Account Permanently
               </Button>
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
           <Button variant="outline" onClick={onClose} className="bg-white border-slate-200">Cancel</Button>
           <Button className="bg-purple-700 hover:bg-purple-800 text-white min-w-[120px]" onClick={handleSave} disabled={isSaving}>
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
           </Button>
        </div>
      </div>
    </>
  )
}