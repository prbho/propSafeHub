import { NextResponse } from 'next/server'

import {
  DATABASE_ID,
  databases,
  PROPERTIES_COLLECTION_ID,
  Query,
} from '@/lib/appwrite'

export async function GET() {
  try {
    const properties = await databases.listDocuments(
      DATABASE_ID,
      PROPERTIES_COLLECTION_ID,
      [Query.limit(50)]
    )

    return NextResponse.json({
      total: properties.total,
      properties: properties.documents.map((p) => ({
        id: p.$id,
        title: p.title,
        city: p.city,
        status: p.status,
        price: p.price,
      })),
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
