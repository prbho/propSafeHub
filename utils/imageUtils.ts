// utils/imageUtils.ts
export function getStableImageUrl(fileId: string, bucketId = 'properties') {
  // Use your Appwrite endpoint
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

  if (!fileId || !endpoint || !projectId) {
    return '/images/placeholder.jpg'
  }

  // Create a stable URL that won't change
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`
}

export function getOptimizedImageUrl(
  fileId: string,
  width?: number,
  height?: number
) {
  const baseUrl = getStableImageUrl(fileId)

  if (!width && !height) return baseUrl

  const params = new URLSearchParams()
  if (width) params.append('width', width.toString())
  if (height) params.append('height', height.toString())

  return `${baseUrl}&${params.toString()}`
}
