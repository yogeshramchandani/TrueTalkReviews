"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function TrendingSection() {
  const [activeId, setActiveId] = useState(0)

  const featuredCategories = [
    { 
      id: 0,
      title: "Home Services", 
      desc: "Cleaning, Moving & Repairs", 
      img: "https://cdn.pixabay.com/photo/2025/06/16/12/52/cleaning-services-9663247_1280.jpg",
    },
    { 
      id: 1,
      title: "Technology", 
      desc: "Development & IT Support", 
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
    },
    { 
      id: 2,
      title: "Professional Services", 
      desc: "Design, Photo & Music", 
      img: "https://cdn.pixabay.com/photo/2017/05/04/16/37/meeting-2284501_1280.jpg",
    },
    { 
      id: 3,
      title: "Health & Fitness", 
      desc: "Trainers & Nutritionists", 
      img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
    },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[600px] md:h-[500px] w-full max-w-7xl mx-auto">
      {featuredCategories.map((cat) => (
        <div 
          key={cat.id}
          onClick={() => setActiveId(cat.id)}
          onMouseEnter={() => setActiveId(cat.id)}
          className={`
            relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out shadow-md
            ${activeId === cat.id ? "flex-3 md:flex-3" : "flex-1 md:flex-1"}
          `}
        >
          <Image 
            src={cat.img} 
            alt={cat.title}
            fill
            priority={cat.id === 0}
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-transform duration-700 ${activeId === cat.id ? "scale-100" : "scale-125 opacity-80"}`}
          />
          <div className={`absolute inset-0 bg-black/30 transition-colors duration-500 ${activeId === cat.id ? "bg-black/20" : "bg-black/60"}`} />
          
          <div className={`
            absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end h-full
            ${activeId !== cat.id ? "items-center md:items-start" : "items-start"}
          `}>
            <div className={`
              mb-auto ml-auto bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
              transition-all duration-500 delay-100
              ${activeId === cat.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 hidden md:block"}
            `}>
              Popular
            </div>

            <div className={`transition-all duration-500 ${activeId !== cat.id && "md:-rotate-90 md:mb-25 md:whitespace-nowrap"}`}>
              <h3 className={`font-bold text-white leading-tight ${activeId === cat.id ? "text-2xl md:text-3xl mb-9" : "text-xl md:text-2xl"}`}>
                {cat.title}
              </h3>
              
              <div className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${activeId === cat.id ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"}
              `}>
                <p className="text-slate-100 text-sm md:text-base font-medium">
                  {cat.desc}
                </p>
                <Link href={`/categories?sector=${encodeURIComponent(cat.title)}`}>
                  <Button size="sm" className="mt-4 bg-white text-slate-900 hover:bg-teal-50 border-none font-bold">
                    View Pros
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}