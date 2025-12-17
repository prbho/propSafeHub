'use client'

import { Property } from '@/types'
import useSWR from 'swr'

import PropertyCarousel from './PropertyCarousel'
import PropertyCarouselLoading from './PropertyCarouselLoading'

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FeaturedPropertiesCarousel() {
  const { data, error, isLoading } = useSWR(
    '/api/properties?isFeatured=true&limit=12',
    fetcher,
    {
      revalidateOnFocus: false, // don't refetch when user focuses tab
      dedupingInterval: 60000, // prevent multiple requests per minute
    }
  )

  const featuredProperties: Property[] = data?.documents || []

  // Loading state
  if (isLoading) return <PropertyCarouselLoading />

  // Error handling
  if (error)
    return (
      <div>Unable to load featured properties. Please try again later.</div>
    )

  // No featured properties
  if (featuredProperties.length === 0) return null

  return (
    <PropertyCarousel
      properties={featuredProperties}
      title="Explore Verified Properties"
      userId={''}
    />
  )
}
