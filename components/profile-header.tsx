import { Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ShareProfileButton from "./share-profile-button"

interface Provider {
  name: string
  profession: string
  city: string
  photo: string
  averageRating: number
  totalReviews: number
}

export default function ProfileHeader({ provider }: { provider: Provider }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          {/* Profile Info */}
          <div className="flex gap-6 items-start flex-1">
            <Avatar className="w-32 h-32">
              <AvatarImage src={provider.photo || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{provider.name}</h1>
              <p className="text-lg text-foreground/70 mb-3">{provider.profession}</p>

              {/* Rating Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(provider.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{provider.averageRating}</span>
                <span className="text-foreground/60 text-sm">({provider.totalReviews} reviews)</span>
              </div>

              <p className="text-foreground/70 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Available in {provider.city}
              </p>
            </div>
          </div>

          {/* Share Button */}
          <div className="w-full md:w-auto">
            <ShareProfileButton provider={provider} />
          </div>
        </div>
      </div>
    </div>
  )
}
