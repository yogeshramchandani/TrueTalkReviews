import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OverviewCardsProps = {
  reviews: {
    rating: number
  }[]
}

export function OverviewCards({ reviews }: OverviewCardsProps) {
  const totalReviews = reviews.length

  const averageRating =
    reviews.length === 0
      ? "0.0"
      : (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)

  const stats = [
    {
      title: "Total Views",
      value: "—",
      description: "Profile views this month",
      icon: "👁️",
    },
    {
      title: "Total Reviews",
      value: totalReviews.toString(),
      description: "Customer reviews received",
      icon: "⭐",
    },
    {
      title: "Average Rating",
      value: averageRating,
      description: "Out of 5.0",
      icon: "📊",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
