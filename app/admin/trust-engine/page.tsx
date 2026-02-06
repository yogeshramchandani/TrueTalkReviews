"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type TrustRule = {
  id: string
  key: string
  description: string
  weight: number
  enabled: boolean
}

export default function TrustEnginePage() {
  const [rules, setRules] = useState<TrustRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("trust_rules")
      .select("*")
      .order("key")

    if (!error && data) setRules(data)
    setLoading(false)
  }

  const updateRule = async (
    id: string,
    updates: Partial<Pick<TrustRule, "weight" | "enabled">>
  ) => {
    setSaving(id)

    await supabase
      .from("trust_rules")
      .update(updates)
      .eq("id", id)

    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )

    setSaving(null)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Trust Engine</h1>
        <p className="text-sm text-muted-foreground">
          Live scoring rules affecting all professionals. Changes apply instantly.
        </p>
      </div>

      {/* Rules */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Trust Rules</h2>

        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between gap-4 border-b py-3 last:border-0"
          >
            {/* Left */}
            <div className="flex-1">
              <p className="font-medium">{rule.key}</p>
              <p className="text-xs text-muted-foreground">
                {rule.description}
              </p>
            </div>

            {/* Weight */}
            <Input
              type="number"
              className="w-24"
              value={rule.weight}
              onChange={(e) =>
                updateRule(rule.id, { weight: Number(e.target.value) })
              }
            />

            {/* Toggle */}
            <Switch
              checked={rule.enabled}
              onCheckedChange={(val) =>
                updateRule(rule.id, { enabled: val })
              }
            />

            {saving === rule.id && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}
