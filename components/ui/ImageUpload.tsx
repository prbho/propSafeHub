'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  accept?: string
}

interface ImageFile {
  file: File
  previewUrl: string
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 10,
  accept = 'image/*',
}: ImageUploadProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const processFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files).slice(
        0,
        maxImages - imageFiles.length
      )

      if (fileArray.length === 0) return

      // Create ImageFile objects with both File and preview URL
      const newImageFiles = fileArray.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))

      // Add new files to existing ones
      const updatedImageFiles = [...imageFiles, ...newImageFiles].slice(
        0,
        maxImages
      )

      setImageFiles(updatedImageFiles)

      // Send only the File objects to parent
      onImagesChange(updatedImageFiles.map((img) => img.file))
    },
    [imageFiles, maxImages, onImagesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFiles(files)
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFiles(files)
        // Reset input to allow selecting same files again
        e.target.value = ''
      }
    },
    [processFiles]
  )

  const removeImage = useCallback(
    (index: number) => {
      setImageFiles((prev) => {
        const newImageFiles = prev.filter((_, i) => i !== index)

        // Clean up the preview URL to prevent memory leaks
        URL.revokeObjectURL(prev[index].previewUrl)

        // Update parent with remaining files
        onImagesChange(newImageFiles.map((img) => img.file))

        return newImageFiles
      })
    },
    [onImagesChange]
  )

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        processFiles(files)
      }
    }
    input.click()
  }, [accept, processFiles])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Drop your images here
          </p>
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
            PNG, JPG, GIF up to 10MB (max {maxImages} images)
          </p>
        </div>

        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
      </div>

      {/* Image Previews */}
      {imageFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Images ({imageFiles.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {imageFiles.map((imageFile, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                  <Image
                    src={imageFile.previewUrl}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={400}
                    height={300}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {index === 0 && 'Main Image'}
                </div>
              </div>
            ))}

            {imageFiles.length < maxImages && (
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
      )}
    </div>
  )
}
