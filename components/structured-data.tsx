// components/structured-data.tsx

import Script from 'next/script'

type Props = {
  profile: any
  reviews: any[]
}

export default function StructuredData({ profile, reviews }: Props) {
  const reviewCount = reviews.length
  
  // 1. Existing ProfessionalService Schema (For Stars)
  const ratingValue = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1) 
    : "5.0"

  const professionalSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService", 
    "name": profile.full_name, 
    "image": profile.avatar_url,
    "description": profile.bio || `Professional services provided by ${profile.full_name}`,
    "url": `https://truvouch.app/u/${profile.username}`,
    "founder": {
        "@type": "Person",
        "name": profile.full_name
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": profile.city || "India",
      "addressCountry": "IN"
    },
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount > 0 ? reviewCount : "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.slice(0, 3).map(review => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": review.reviewer_name || "Verified User" },
      "datePublished": review.created_at,
      "reviewBody": review.content,
      "reviewRating": { "@type": "Rating", "ratingValue": review.rating }
    }))
  }

  // 2. NEW: Breadcrumb Schema (The "Justdial" Hierarchy)
  // Logic: Home > [City] > [Profession] > [Name]
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://truvouch.app"
      },
      // If they have a city, make it level 2
      ...(profile.city ? [{
        "@type": "ListItem",
        "position": 2,
        "name": profile.city,
        "item": `https://truvouch.app/categories?city=${encodeURIComponent(profile.city)}`
      }] : []),
      {
        "@type": "ListItem",
        "position": profile.city ? 3 : 2,
        "name": profile.profession || "Professional",
        "item": `https://truvouch.app/categories?q=${encodeURIComponent(profile.profession || '')}`
      },
      {
        "@type": "ListItem",
        "position": profile.city ? 4 : 3,
        "name": profile.full_name,
        "item": `https://truvouch.app/u/${profile.username}`
      }
    ]
  }

  return (
    <>
      <Script
        id="json-ld-professional"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
    </>
  )
}