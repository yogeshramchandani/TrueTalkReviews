"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { toast } from "sonner"

export default function DisputeUploadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkDisputeStatus() {
      const { data, error } = await supabase
        .from('reviews')
        .select('dispute_notified_at, dispute_status')
        .eq('id', id)
        .single()

      if (data?.dispute_notified_at) {
        const deadline = new Date(data.dispute_notified_at).getTime() + (48 * 60 * 60 * 1000)
        if (new Date().getTime() > deadline || data.dispute_status === 'disabled') {
          setIsExpired(true)
        }
      }
      if (data?.dispute_status === 'proof_submitted') {
        setIsSuccess(true)
      }
      setLoading(false)
    }
    checkDisputeStatus()
  }, [id])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}-${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dispute-proofs')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('dispute-proofs')
        .getPublicUrl(fileName)

      // 2. Update the review record via API to ensure security
      const res = await fetch('/api/reviews/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, proofUrl: publicUrl })
      })

      if (!res.ok) throw new Error("Failed to update dispute status")

      setIsSuccess(true)
      toast.success("Evidence submitted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (isExpired) return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center border-red-100 bg-red-50">
        <CardContent className="pt-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800">Link Expired</h2>
          <p className="text-red-600 mt-2">The 48-hour window to provide evidence has closed. This review has been disabled.</p>
        </CardContent>
      </Card>
    </div>
  )

  if (isSuccess) return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center border-teal-100 bg-teal-50">
        <CardContent className="pt-6">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-teal-800">Evidence Received</h2>
          <p className="text-teal-600 mt-2">Our admin team is reviewing your documents. You will be notified of the outcome.</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-none rounded-3xl overflow-hidden">
        <CardHeader className="bg-teal-700 text-white p-8">
          <CardTitle className="text-2xl font-bold">Evidence Submission</CardTitle>
          <p className="text-teal-100 text-sm mt-2">Upload an invoice, receipt, or chat log to verify your service.</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${file ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-400'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
            }}
          >
            <input 
              type="file" 
              id="file-upload" 
              hidden 
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              accept="image/*,.pdf"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              {file ? (
                <>
                  <FileText className="w-12 h-12 text-teal-600 mb-2" />
                  <span className="text-sm font-bold text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-400 mt-1">Click to change file</span>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-sm font-medium text-slate-500">Drag & drop or <span className="text-teal-600 font-bold">browse</span></span>
                  <span className="text-xs text-slate-400 mt-2">Supports JPG, PNG, or PDF</span>
                </>
              )}
            </label>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            className="w-full h-12 bg-teal-700 hover:bg-teal-800 rounded-xl font-bold text-lg"
          >
            {uploading ? <Loader2 className="animate-spin mr-2" /> : "Submit Evidence"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}