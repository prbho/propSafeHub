// utils/image-cropper.ts
/**
 * Simple client-side image cropper that doesn't use modals
 * Users can upload pre-cropped images
 */

 

export interface CropOptions {
  aspectRatio?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Create a square thumbnail from an image file
 */
export async function createSquareThumbnail(
  file: File,
  options: CropOptions = {}
): Promise<File> {
  const {
    aspectRatio = 1,
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.92,
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate crop dimensions
      let sourceX = 0
      let sourceY = 0
      let sourceSize = 0

      if (img.width > img.height) {
        // Landscape image - crop width
        sourceSize = img.height
        sourceX = (img.width - sourceSize) / 2
      } else {
        // Portrait or square image - crop height
        sourceSize = img.width
        sourceY = (img.height - sourceSize) / 2
      }

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Set canvas size
      const size = Math.min(sourceSize, maxWidth, maxHeight)
      canvas.width = size
      canvas.height = size

      // Draw cropped image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize, // Source rectangle
        0,
        0,
        size,
        size // Destination rectangle
      )

      // Convert to blob then to file
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'))
            return
          }

          const croppedFile = new File([blob], `cropped-${file.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          resolve(croppedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Check if image has square aspect ratio (1:1)
 */
export async function isSquareImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const aspectRatio = img.width / img.height
      const isSquare = Math.abs(aspectRatio - 1) < 0.05 // 5% tolerance
      resolve(isSquare)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }

    img.src = url
  })
}

/**
 * Auto-crop non-square images to square
 */
export async function autoCropToSquare(file: File): Promise<File> {
  try {
    const squareFile = await createSquareThumbnail(file)
    return squareFile
  } catch (error) {
    console.error('Failed to auto-crop image:', error)
    throw error
  }
}
