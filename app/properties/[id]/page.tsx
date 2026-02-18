import { notFound } from 'next/navigation'
import { Property } from '@/types'

import PropertyDetails from '@/components/PropertyDetails'
import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
} from '@/lib/appwrite-server'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getProperty(
  id: string,
  options?: { incrementViews?: boolean }
): Promise<Property> {
  try {
    if (!id) {
      throw new Error('Missing document ID')
    }

    const property = await databases.getDocument(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      id
    )

    if (options?.incrementViews) {
      void databases
        .updateDocument(DATABASE_ID, PROPERTIES_COLLECTION_ID, id, {
          views: (property.views || 0) + 1,
        })
        .catch((error) => {
          console.error('Error incrementing property views:', error)
        })
    }

    return property as unknown as Property
  } catch (error) {
    console.error('Error fetching property:', error)
    throw new Error('Property not found')
  }
}

export default async function PropertyPage(props: PageProps) {
  const params = await props.params
  let property: Property

  try {
    property = await getProperty(params.id, { incrementViews: true })
  } catch {
    notFound()
  }

  return <PropertyDetails property={property} />
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params

  try {
    const property = await getProperty(params.id, { incrementViews: false })

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
