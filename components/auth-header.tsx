import Link from "next/link"

interface AuthHeaderProps {
  title: string
  subtitle?: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <Link href="/" className="inline-block mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-foreground">SaaS</span>
        </div>
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  )
}
