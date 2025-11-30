'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

export default function UploadPropertiesPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const uploadProperties = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/upload-properties', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Properties uploaded successfully!')
      } else {
        setMessage('❌ Failed to upload properties')
      }
    } catch (error) {
      setMessage('❌ Error uploading properties')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Sample Properties</h1>
      <p className="text-gray-600 mb-6">
        This will upload 20 sample properties to your Appwrite database for
        testing.
      </p>

      <Button
        onClick={uploadProperties}
        disabled={loading}
        className="bg-emerald-600 hover:bg-blue-700"
      >
        {loading ? 'Uploading...' : 'Upload 20 Sample Properties'}
      </Button>

      {message && (
        <div
          className={`mt-4 p-4 rounded ${
            message.includes('✅')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">What will be uploaded:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>
            20 diverse properties across different cities (NY, LA, Chicago,
            Miami, Austin)
          </li>
          <li>Mix of houses, apartments, condos, and townhouses</li>
          <li>Properties for both sale and rent</li>
          <li>Realistic pricing based on location and property type</li>
          <li>High-quality images from Unsplash</li>
          <li>Various features and amenities</li>
          <li>Some properties marked as featured and verified</li>
        </ul>
      </div>
    </div>
  )
}
