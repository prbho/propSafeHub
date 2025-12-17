import '@/lib/appwrite-build-fix'
// app/api/footer-data/route.ts
import { NextResponse } from 'next/server'
import { Query } from 'appwrite'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite'

export async function GET() {
  try {
    // Get properties data for popular locations
    const propertiesResponse = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [
        Query.equal('isActive', true),
        Query.limit(100), // Get enough data to analyze
      ]
    )

    const properties = propertiesResponse.documents || []

    // Analyze data to find popular markets (for sale)
    const saleLocations = new Map<string, number>()
    const rentLocations = new Map<string, number>()
    const states = new Set<string>()

    properties.forEach((property) => {
      if (property.city && property.status) {
        if (property.status === 'for-sale') {
          saleLocations.set(
            property.city,
            (saleLocations.get(property.city) || 0) + 1
          )
        } else if (property.status === 'for-rent') {
          rentLocations.set(
            property.city,
            (rentLocations.get(property.city) || 0) + 1
          )
        }

        if (property.state) {
          states.add(property.state)
        }
      }
    })

    // Convert to arrays and sort by count
    const popularMarkets = Array.from(saleLocations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        type: 'sale' as const,
      }))

    const popularApartments = Array.from(rentLocations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        type: 'rent' as const,
      }))

    const statesArray = Array.from(states).slice(0, 12)

    const footerData = {
      popularMarkets,
      popularApartments,
      resources: [
        { title: 'Homes for sale near me', href: '/properties?type=buy' },
        {
          title: 'Apartments for rent',
          href: '/properties?type=rent&propertyType=apartment',
        },
        { title: 'Property valuation', href: '/valuation' },
        { title: 'Real estate guides', href: '/guides' },
        { title: 'Mortgage calculator', href: '/calculator' },
        { title: 'Agent directory', href: '/agents' },
      ],
      states: statesArray,
    }

    return NextResponse.json(footerData)
  } catch {
    // Return fallback data
    return NextResponse.json({
      popularMarkets: [
        { name: 'Lekki, Lagos', count: 1240, type: 'sale' },
        { name: 'Victoria Island', count: 890, type: 'sale' },
        { name: 'Ikoyi, Lagos', count: 670, type: 'sale' },
        { name: 'Abuja Central', count: 1560, type: 'sale' },
        { name: 'Ikeja, Lagos', count: 980, type: 'sale' },
      ],
      popularApartments: [
        { name: 'Maitama, Abuja', count: 320, type: 'rent' },
        { name: 'Yaba, Lagos', count: 280, type: 'rent' },
        { name: 'Gwarinpa, Abuja', count: 190, type: 'rent' },
        { name: 'Surulere, Lagos', count: 210, type: 'rent' },
        { name: 'Asokoro, Abuja', count: 150, type: 'rent' },
      ],
      resources: [
        { title: 'Homes for sale near me', href: '/properties?type=buy' },
        {
          title: 'Apartments for rent',
          href: '/properties?type=rent&propertyType=apartment',
        },
        { title: 'Property valuation', href: '/valuation' },
        { title: 'Real estate guides', href: '/guides' },
      ],
      states: [
        'Lagos',
        'Abuja',
        'Rivers',
        'Oyo',
        'Kano',
        'Kaduna',
        'Edo',
        'Delta',
      ],
    })
  }
}
