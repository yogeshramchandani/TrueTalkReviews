import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: Change this to 'https://truvouch.tech' once you connect your new domain!
  const baseUrl = 'https://truvouch.vercel.app'

  // 1. Define Static Routes (These will ALWAYS work)
  const staticRoutes = [
    '',              // Homepage
    '/categories',   
    '/search',
    '/contact',
    '/community-guidelines',
    '/safety-guidelines',
    '/about'    
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  let profileRoutes: MetadataRoute.Sitemap = []

  // 2. Try to fetch Dynamic Routes (Safe Mode)
  try {
    // We use the direct supabase-js client here to avoid 'cookie' errors during build time
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
       console.warn("Supabase keys missing: Skipping dynamic profile generation.")
    } else {
       const supabase = createClient(supabaseUrl, supabaseKey)

       const { data: professionals, error } = await supabase
         .from('profiles')
         .select('username, updated_at')
         .eq('role', 'professional')
       
       if (error) throw error

       if (professionals) {
         profileRoutes = professionals.map((user) => ({
           url: `${baseUrl}/u/${user.username}`,
           lastModified: new Date(user.updated_at || new Date()),
           changeFrequency: 'daily' as const,
           priority: 0.8,
         }))
       }
    }
  } catch (err) {
    console.error("Sitemap Warning: Failed to fetch profiles.", err)
    // We swallow the error so the static sitemap still generates!
  }

  // 3. Return Combined
  return [...staticRoutes, ...profileRoutes]
}