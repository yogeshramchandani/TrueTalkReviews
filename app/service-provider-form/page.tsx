import { ServiceProviderForm } from "@/components/service-provider-form"

export const metadata = {
  title: "Service Provider Profile",
  description: "Create your professional service provider profile",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ServiceProviderForm />
    </main>
  )
}
