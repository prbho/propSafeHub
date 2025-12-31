// components/properties/PropertyMap.tsx

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths
// Remove the private property to fix the icon paths
if (typeof window !== 'undefined') {
  // Access the prototype with proper type checking
  const defaultIconProto = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: string
  }

  if (defaultIconProto._getIconUrl) {
    delete defaultIconProto._getIconUrl
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  })
}

// Alternative: Use CDN URLs instead of local files (more reliable)
// if (typeof window !== 'undefined') {
//   // Fix Leaflet default icon paths using CDN
//   const defaultIconProto = L.Icon.Default.prototype as unknown as {
//     _getIconUrl?: string;
//   };

//   if (defaultIconProto._getIconUrl) {
//     delete defaultIconProto._getIconUrl;
//   }

//   L.Icon.Default.mergeOptions({
//     iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//     iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//     shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   });
// }

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

interface PropertyMapProps {
  latitude?: number
  longitude?: number
  address: string
  city: string
  state: string
  country?: string
}

// Function to adjust coordinates when they don't match the city/address
const getAdjustedCoordinates = (
  lat: number,
  lng: number,
  city: string,
  address: string
): [number, number] => {
  const lowerCity = city.toLowerCase()
  const lowerAddress = address.toLowerCase()

  // Check if address mentions Ibeju-Lekki but coordinates are in Ikeja area
  const isIbejuLekkiAddress =
    lowerCity.includes('ibeju') ||
    lowerAddress.includes('ibeju') ||
    lowerAddress.includes('lekki epe') ||
    lowerAddress.includes('alaro city')

  const isIkejaCoordinates =
    lat >= 6.45 && lat <= 6.65 && lng >= 3.3 && lng <= 3.45

  if (isIbejuLekkiAddress && isIkejaCoordinates) {
    console.log('📍 Adjusting coordinates from Ikeja to Ibeju-Lekki')
    return [6.4589, 3.6018] // Ibeju-Lekki coordinates
  }

  return [lat, lng]
}

export default function PropertyMap({
  latitude,
  longitude,
  address,
  city,
  state,
  country = 'Nigeria',
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [isAdjusted, setIsAdjusted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    setIsLoading(true)

    console.log('🌍 Map Data:', {
      latitude,
      longitude,
      address,
      city,
      state,
      country,
    })

    const processCoordinates = async () => {
      if (latitude && longitude) {
        console.log('✅ Using provided coordinates')

        // Check if we need to adjust coordinates
        const adjusted = getAdjustedCoordinates(
          latitude,
          longitude,
          city,
          address
        )
        setCoordinates(adjusted)
        setIsAdjusted(adjusted[0] !== latitude || adjusted[1] !== longitude)
        setIsLoading(false)
      } else {
        // Try to geocode the address
        await geocodeAddress()
      }
    }

    processCoordinates()
  }, [latitude, longitude, address, city, state, country])

  const geocodeAddress = async () => {
    const fullAddress = `${address}, ${city}, ${state}, ${country}`
    console.log('🔍 Geocoding address:', fullAddress)

    try {
      // Using OpenStreetMap Nominatim API with Nigeria country code filter
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          fullAddress
        )}&format=json&limit=1&countrycodes=ng&addressdetails=1`
      )

      const data = await response.json()
      console.log('🗺️ Geocoding response:', data)

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        console.log('✅ Geocoded coordinates:', { lat, lon })

        // Check if we need to adjust these coordinates too
        const adjusted = getAdjustedCoordinates(lat, lon, city, address)
        setCoordinates(adjusted)
        setIsAdjusted(adjusted[0] !== lat || adjusted[1] !== lon)
      } else {
        console.log('❌ No geocoding results, using fallback')
        getFallbackCoordinates()
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error)
      getFallbackCoordinates()
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackCoordinates = () => {
    // Try to get coordinates based on city/state with adjustment
    const stateCoords: Record<string, [number, number]> = {
      Lagos: [6.5244, 3.3792],
      Abuja: [9.0765, 7.3986],
      Rivers: [4.8156, 7.0498],
      Oyo: [7.3775, 3.947],
      Kano: [12.0022, 8.592],
      Delta: [5.532, 5.8987],
      Imo: [5.572, 7.0588],
      Kaduna: [10.5264, 7.4388],
      Ogun: [6.99, 3.59],
      Ondo: [7.25, 5.195],
      Osun: [7.5629, 4.52],
      Plateau: [9.8965, 8.8583],
      Sokoto: [13.0059, 5.2476],
      Anambra: [6.22, 7.07],
      Bauchi: [10.301, 9.8237],
      Benue: [7.7327, 8.5211],
      Borno: [11.8333, 13.15],
      'Cross River': [5.87, 8.5988],
      Ebonyi: [6.246, 8.084],
      Edo: [6.34, 5.62],
      Ekiti: [7.6333, 5.2167],
      Enugu: [6.4527, 7.5104],
      Gombe: [10.2897, 11.1673],
      Jigawa: [12.0, 9.75],
      Katsina: [12.9908, 7.6],
      Kebbi: [12.45, 4.1995],
      Kogi: [7.8004, 6.7333],
      Kwara: [8.5, 4.55],
      Nasarawa: [8.5, 8.5],
      Niger: [9.6, 6.55],
      Taraba: [8.8833, 11.3667],
      Yobe: [12.0, 11.5],
      Zamfara: [12.1704, 6.66],
      'Akwa Ibom': [5.0077, 7.8494],
      Bayelsa: [4.7719, 6.0699],
    }

    let coords = stateCoords[state] || [9.082, 8.6753] // Default to Nigeria center

    // If it's Ibeju-Lekki specifically, use those coordinates
    if (
      city.toLowerCase().includes('ibeju') ||
      address.toLowerCase().includes('ibeju')
    ) {
      coords = [6.4589, 3.6018]
      setIsAdjusted(true)
    } else {
      setIsAdjusted(true) // Mark as adjusted since we're using fallback
    }

    console.log('📍 Using fallback coordinates:', state, coords)
    setCoordinates(coords)
    setIsLoading(false)
  }

  const fullAddress = `${address}, ${city}, ${state}, ${country}`

  if (!isClient || isLoading) {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!coordinates) {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600">Unable to load map location</p>
          <p className="text-sm text-gray-500 mt-2">Address: {fullAddress}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={coordinates}
        zoom={15}
        className="h-full w-full z-10!"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-900 mb-2">
                Property Location
              </h3>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-700">{address}</p>
                <p className="text-sm text-gray-600">
                  {city}, {state}, {country}
                </p>
              </div>

              {isAdjusted && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    ⚠️ Note: Showing approximate location
                  </p>
                  <p className="text-xs text-amber-600">
                    {city.toLowerCase().includes('ibeju')
                      ? 'Adjusted to Ibeju-Lekki area based on address'
                      : 'Using best available location data'}
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Location details
                  </summary>
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="text-gray-500">Displayed:</span>{' '}
                      <span className="font-medium">
                        {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                      </span>
                    </div>
                    {latitude && longitude && (
                      <div>
                        <span className="text-gray-500">Original:</span>{' '}
                        <span className="font-medium">
                          {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Zoom:</span>{' '}
                      <span className="font-medium">15</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Additional information below the map */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Location:</span> {city}, {state}
          </div>
          <div className="flex items-center gap-2">
            {isAdjusted && (
              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-700">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Approximate
              </span>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
