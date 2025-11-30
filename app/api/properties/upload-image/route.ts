// app/api/properties/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { ID, serverStorage, STORAGE_BUCKET_ID } from '@/lib/appwrite-server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Upload to Appwrite Storage using the File object directly
    const file = await serverStorage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      imageFile
    )

    // Generate file URL for accessing the image
    // Adjust the URL based on your Appwrite configuration
    const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    return NextResponse.json({
      success: true,
      fileId: file.$id,
      fileName: file.name,
      fileUrl: fileUrl,
    })
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to upload image',
      },
      { status: 500 }
    )
  }
}
