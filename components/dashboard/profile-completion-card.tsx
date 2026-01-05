import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ProfileCompletionCardProps = {
  profile: {
    full_name?: string
    profession?: string
    bio?: string
    city?: string
    photo_url?: string
  }
}

function calculateProfileCompletion(profile: ProfileCompletionCardProps["profile"]) {
  const fields = ["full_name", "profession", "bio", "city", "photo_url"]
  const filled = fields.filter((field) => profile[field as keyof typeof profile]).length
  return Math.round((filled / fields.length) * 100)
}

export function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const completionPercentage = calculateProfileCompletion(profile)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
        <CardDescription>Complete your profile to get more visibility</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {completionPercentage}% Complete
            </span>
            <span className="text-sm text-muted-foreground">
              {completionPercentage === 100
                ? "Fully Complete"
                : `${100 - completionPercentage}% remaining`}
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <StatusItem label="Profile Photo" done={!!profile.photo_url} />
          <StatusItem label="Bio" done={!!profile.bio} />
          <StatusItem label="Profession" done={!!profile.profession} />
          <StatusItem label="City" done={!!profile.city} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatusItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1">
        {done ? "✓" : "-"}
      </p>
    </div>
  )
}
