"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Mail, MessageSquare, User, Loader2, CheckCircle, Send } from "lucide-react"

interface BookingFormDialogProps {
  providerId: string
  providerName: string
}

export function BookingFormDialog({ providerId, providerName }: BookingFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          provider_id: providerId,
          client_name: formData.name,
          client_email: formData.email,
          preferred_date: formData.date || null,
          message: formData.message
        })

      if (error) throw error

      setIsSuccess(true)
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setOpen(false)
        setIsSuccess(false)
        setFormData({ name: "", email: "", date: "", message: "" })
      }, 2500)

    } catch (error) {
      console.error('Error sending lead:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 px-6 font-bold flex items-center gap-2">
           <Mail className="w-4 h-4" /> Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
              <p className="text-slate-500 mt-2">
                Thanks! {providerName} has received your inquiry and will be in touch shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Contact {providerName}</DialogTitle>
              <DialogDescription>
                Fill out the form below to request a booking or ask a question.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Your Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Date Input (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-600"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Message
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Hi, I'm interested in your services..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Inquiry <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}