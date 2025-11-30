'use client'

import { useCallback, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

import { Location } from '@/lib/locations/locationService'

interface LocationMapPreviewProps {
  location: Location
  className?: string
  height?: number
}

export default function LocationMapPreview({
  location,
  className = '',
  height = 200,
}: LocationMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  const loadMapPreview = useCallback(() => {
    if (!location.latitude || !location.longitude) return

    // Simple static map implementation
    // Replace with your preferred map service
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?
      center=${location.latitude},${location.longitude}&
      zoom=13&
      size=600x${height}&
      markers=color:red%7C${location.latitude},${location.longitude}&
      key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`.replace(/\s/g, '')

    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <img 
          src="${staticMapUrl}" 
          alt="Map of ${location.name}"
          class="w-full h-full object-cover rounded-lg"
          onerror="this.style.display='none'"
        />
      `
    }
  }, [location.latitude, location.longitude, location.name, height])

  useEffect(() => {
    if (location.latitude && location.longitude && mapRef.current) {
      // Initialize map here - using static image for now
      // In production, integrate with Google Maps, Mapbox, or Leaflet
      loadMapPreview()
    }
  }, [location, loadMapPreview])

  if (!location.latitude || !location.longitude) {
    return (
      <div
        ref={mapRef}
        className={`bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div className="text-sm">No map data available</div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={`bg-gray-100 rounded-lg ${className}`}
      style={{ height: `${height}px` }}
    />
  )
}
