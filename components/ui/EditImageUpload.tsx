'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: Array<{ file: File; previewUrl: string }>
  onChange?: (imagesData: Array<{ file: File; previewUrl: string }>) => void
  onImagesChange?: (files: File[]) => void
  maxImages?: number
  accept?: string
  currentCount?: number
}

interface ImageFile {
  file: File
  previewUrl: string
  blobUrl?: string
}

export default function EditImageUpload({
  value,
  onChange,
  onImagesChange,
  maxImages = 10,
  accept = 'image/*',
}: ImageUploadProps) {
  // Use internal state if no value prop (uncontrolled), otherwise use controlled value
  const [internalImageFiles, setInternalImageFiles] = useState<ImageFile[]>([])
  const imageFiles = value !== undefined ? value : internalImageFiles
  const setImageFiles = onChange || setInternalImageFiles

  const [isDragging, setIsDragging] = useState(false)

  // Use a ref to track imageFiles for callbacks
  const imageFilesRef = useRef<ImageFile[]>([])
  // Ref to track mounted state
  const isMounted = useRef(true)

  // Keep the ref in sync with state
  useEffect(() => {
    imageFilesRef.current = imageFiles
  }, [imageFiles])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [value])

  // Convert File to data URL for preview
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files).slice(
        0,
        maxImages - imageFilesRef.current.length
      )

      if (fileArray.length === 0) return

      // Create ImageFile objects with data URLs for preview
      const newImageFiles = await Promise.all(
        fileArray.map(async (file) => {
          const previewUrl = await fileToDataURL(file)

          return {
            file,
            previewUrl, // Data URL for preview
          }
        })
      )

      // Add new files to existing ones
      const updatedImageFiles = [
        ...imageFilesRef.current,
        ...newImageFiles,
      ].slice(0, maxImages)

      setImageFiles(updatedImageFiles)

      // Schedule parent update to avoid render-phase issues
      requestAnimationFrame(() => {
        // Call onImagesChange with just the files (blobs for Appwrite)
        if (onImagesChange) {
          onImagesChange(updatedImageFiles.map((img) => img.file))
        }
      })
    },
    [maxImages, onImagesChange, setImageFiles]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        await processFiles(files)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        await processFiles(files)
        // Reset input to allow selecting same files again
        e.target.value = ''
      }
    },
    [processFiles]
  )

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        await processFiles(files)
      }
    }
    input.click()
  }, [accept, processFiles])

  // Calculate remaining slots
  const remainingSlots = maxImages - imageFiles.length
  const hasReachedMax = imageFiles.length >= maxImages

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${hasReachedMax ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={!hasReachedMax ? handleDrop : undefined}
        onDragOver={!hasReachedMax ? handleDragOver : undefined}
        onDragLeave={!hasReachedMax ? handleDragLeave : undefined}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">
            {hasReachedMax ? 'Maximum images reached' : 'Drop your images here'}
          </p>
          {!hasReachedMax && (
            <>
              <p className="text-sm text-gray-500">
                or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF up to 10MB ({remainingSlots} remaining)
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
          disabled={hasReachedMax}
        />
      </div>

      {/* Image Previews */}
      {/* {imageFiles.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {!hasReachedMax && (
              <button
                type="button"
                onClick={openFileDialog}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors"
              >
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Add More</span>
              </button>
            )}
          </div>
        </div>
      )} */}
    </div>
  )
}
