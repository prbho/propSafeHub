// app/list-property/rent/page.tsx
'use client'

import PropertyListingForm from '@/components/PropertyListingForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ListPropertyForRentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              List Your Property for Rent
            </h1>
            <p className="text-gray-600">
              Fill out the form below to list your rental property
            </p>
          </div>
          <ProtectedRoute>
            <PropertyListingForm listingType="rent" />
          </ProtectedRoute>
        </div>
      </div>
    </div>
  )
}
