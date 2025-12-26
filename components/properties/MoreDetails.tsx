// components/properties/PropertyDetails.tsx
'use client'

import { Property } from '@/types'
import { Calendar, Car, Clock, Home, Tag } from 'lucide-react'

interface MoreDetailsProps {
  property: Property
}

export default function MoreDetails({ property }: MoreDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const details = [
    {
      icon: Tag,
      label: 'Status',
      value: property.status.replace('-', ' '),
      capitalize: true,
    },
    {
      icon: Home,
      label: 'Type',
      value: property.propertyType,
      capitalize: true,
    },
    ...(property.yearBuilt
      ? [
          {
            icon: Clock,
            label: 'Year Built',
            value: property.yearBuilt.toString(),
          },
        ]
      : []),
    {
      icon: Calendar,
      label: 'Listed',
      value: formatDate(property.listDate),
    },

    ...(property.lotSize
      ? [
          {
            icon: Car,
            label: 'Lot Size',
            value: `${property.lotSize.toLocaleString()} m²`,
          },
        ]
      : []),
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        More Details
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-3 bg-emerald-50 rounded-lg transition-colors"
          >
            <detail.icon className="w-6 h-6 text-emerald-600 mb-2" />
            <span className="text-xs text-gray-600 font-medium mb-1">
              {detail.label}
            </span>
            <span
              className={`text-sm font-semibold text-gray-900 ${
                detail.capitalize ? 'capitalize' : ''
              }`}
            >
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
