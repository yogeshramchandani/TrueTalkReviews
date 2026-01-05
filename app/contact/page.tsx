import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in touch</h1>
          <p className="text-slate-500 text-lg">We'd love to hear from you. Our team is always here to chat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <p className="text-slate-500 text-sm mb-2">Our friendly team is here to help.</p>
                  <p className="text-teal-700 font-semibold">support@truetalkreviews.com</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Office</h3>
                  <p className="text-slate-500 text-sm mb-2">Come say hello at our office HQ.</p>
                  <p className="text-slate-900 font-medium">Bhilwara, Rajasthan, India</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                  <p className="text-slate-500 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                  <p className="text-slate-900 font-medium">+91 123 456 7890</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 border-slate-200">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input type="email" placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Message</label>
                <Textarea placeholder="Leave us a message..." className="min-h-[150px]" />
              </div>
              <Button className="w-full bg-teal-800 hover:bg-teal-900">Send Message</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}