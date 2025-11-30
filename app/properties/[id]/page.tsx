import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Property } from '@/types'

import PropertyDetails from '@/components/PropertyDetails'
import PropertyDetailsLoading from '@/components/PropertyDetailsLoading'
import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getProperty(id: string): Promise<Property> {
  try {
    if (!id) {
      throw new Error('Missing document ID')
    }

    const property = await databases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      id
    )

    // Update view count
    await databases.updateDocument(DATABASE_ID, PROPERTIES_COLLECTION_ID, id, {
      views: (property.views || 0) + 1,
    })

    // Cast to Property type
    return property as unknown as Property
  } catch {
    console.error('Error fetching property')
    throw new Error('Property not found')
  }
}

export default async function PropertyPage(props: PageProps) {
  // Unwrap the params promise
  const params = await props.params
  let property: Property

  try {
    property = await getProperty(params.id)
  } catch {
    notFound()
  }

  return (
    <Suspense fallback={<PropertyDetailsLoading />}>
      <PropertyDetails property={property} />
    </Suspense>
  )
}

// Generate metadata for SEO
export async function generateMetadata(props: PageProps) {
  // Unwrap the params promise
  const params = await props.params

  try {
    const property = await getProperty(params.id)

    return {
      title: `${property.title} | ${property.city}, ${property.state} - PropSafeHub`,
      description: property.description.substring(0, 160) + '...',
      openGraph: {
        title: property.title,
        description: property.description.substring(0, 160) + '...',
        images: property.images.length > 0 ? [property.images[0]] : [],
      },
    }
  } catch {
    return {
      title: 'Property Not Found - PropSafeHub',
      description: 'The property you are looking for does not exist.',
    }
  }
}
