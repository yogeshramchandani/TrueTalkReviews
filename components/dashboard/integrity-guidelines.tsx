"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ShieldCheck, FileText, AlertTriangle, UserCheck, Gavel, Scale } from "lucide-react"

interface IntegrityGuidelinesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntegrityGuidelinesDialog({ open, onOpenChange }: IntegrityGuidelinesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black text-teal-800">
            <ShieldCheck className="w-8 h-8 text-teal-600" /> 
            Integrity Standards
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500">
            TruVouch is built on trust. All professionals and reviewers must adhere to these non-negotiable guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Section 1: Review Authenticity */}
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">1. Authentic Interactions Only</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Reviews must represent a genuine service experience. <strong>Vouching for fake reviews</strong> to boost your score is a severe violation. If discovered, your verified status will be revoked immediately.
              </p>
            </div>
          </div>

          {/* Section 2: The Vouching Process */}
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">2. Verification & Evidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                When you click <strong>"Vouch"</strong>, you certify that the reviewer was a real client. In the event of a dispute, both parties must be able to provide proof of service (invoice, payment receipt, or appointment logs).
              </p>
            </div>
          </div>

          {/* Section 3: Dispute Policy */}
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">3. Fair Dispute Resolution</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Disputes are manually reviewed by our legal team.
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
                  <li>If a Reviewer fails to provide proof within <strong>48 hours</strong>, the review is removed.</li>
                  <li>If proof is provided and valid, the Professional receives a <strong>Penalty Strike</strong>.</li>
                </ul>
              </p>
            </div>
          </div>

          {/* Section 4: Zero Tolerance */}
          <div className="flex gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">4. Zero Tolerance Policy</h3>
              <p className="text-sm text-red-600 leading-relaxed mt-1">
                Submitting fake evidence during a dispute or accumulating <strong>3 Strikes</strong> will result in a permanent account ban. We prioritize the safety and trust of our community above all else.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-2">
          <p className="text-xs text-center text-slate-400">
            Last updated: Febuary 24, 2025 • Questions? Contact <a href="mailto:responsetruvouch@gmail.com" className="text-teal-600 hover:underline">responsetruvouch@gmail.com</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}