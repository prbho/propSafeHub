// components/property/SortableItem.tsx - FIXED VERSION
'use client'

import { useEffect, useRef, useState } from 'react' // Added useRef
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TooltipContent } from '@radix-ui/react-tooltip'
import {
  AlertCircle,
  Clock,
  FileImage,
  GripVertical,
  Image as ImageIcon,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface SortableItemProps {
  id: string
  imageUrl: string
  displayUrl: string
  index: number
  isMainImage: boolean
  isNew: boolean
  isUploading: boolean
  isFailed: boolean
  isMarkedForDeletion: boolean
  isBlob: boolean
  newImages: Array<{ file: File; previewUrl: string }>
  failedImages: Set<string>
  dataUrls: Map<string, string>
  onDeleteImage: (imageUrl: string) => void
  onDeleteNewImage?: (fileIndex: number) => void
  onSetAsMain: (imageUrl: string) => void
  onSetNewAsMain?: (fileIndex: number) => void
  setFailedImages: React.Dispatch<React.SetStateAction<Set<string>>>
  setDataUrls: React.Dispatch<React.SetStateAction<Map<string, string>>>
  isDraggingOverlay?: boolean
}

export function SortableItem({
  id,
  imageUrl,
  displayUrl,
  index,
  isMainImage,
  isNew,
  isUploading,
  isFailed,
  isMarkedForDeletion,
  isBlob,
  newImages,
  onDeleteImage,
  onDeleteNewImage,
  onSetAsMain,
  onSetNewAsMain,
  setFailedImages,
  setDataUrls,
  isDraggingOverlay = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Use a ref to track previous displayUrl
  const prevDisplayUrlRef = useRef(displayUrl)
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState(displayUrl)
  const [hasError, setHasError] = useState(false)

  // Update display URL when it changes - FIXED VERSION
  useEffect(() => {
    // Only update if displayUrl actually changed
    if (prevDisplayUrlRef.current !== displayUrl) {
      prevDisplayUrlRef.current = displayUrl

      // Use requestAnimationFrame to defer the state update
      // This prevents cascading renders
      const rafId = requestAnimationFrame(() => {
        setCurrentDisplayUrl(displayUrl)
        setHasError(false)
      })

      // Clean up the animation frame if component unmounts
      return () => cancelAnimationFrame(rafId)
    }
  }, [displayUrl])

  const handleImageError = () => {
    console.warn('Image failed to load:', currentDisplayUrl)
    setHasError(true)

    // For data URLs, we can't really retry - just mark as failed
    setFailedImages((prev) => new Set(prev).add(imageUrl))
  }

  const handleRetryImage = async () => {
    const newImage = newImages.find((img) => img?.previewUrl === imageUrl)

    if (newImage && isBlob) {
      try {
        // Create a new blob URL
        const newBlobUrl = URL.createObjectURL(newImage.file)
        setCurrentDisplayUrl(newBlobUrl)
        setHasError(false)
        setFailedImages((prev) => {
          const newSet = new Set(prev)
          newSet.delete(imageUrl)
          return newSet
        })
      } catch (error) {
        console.error('Failed to retry image:', error)
      }
    } else {
      // For non-blob URLs, just remove from failed list
      setFailedImages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(imageUrl)
        return newSet
      })
      setHasError(false)
    }
  }

  const getFileName = () => {
    const newImage = newImages.find((img) => img?.previewUrl === imageUrl)
    if (newImage?.file?.name) {
      return newImage.file.name
    }
    return `Image ${index + 1}`
  }

  const getFileSize = () => {
    const newImage = newImages.find((img) => img?.previewUrl === imageUrl)
    if (newImage?.file?.size) {
      const sizeInKB = (newImage.file.size / 1024).toFixed(0)
      return `${sizeInKB} KB`
    }
    return null
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border rounded-lg overflow-hidden ${
        isNew ? 'border-dashed border-blue-300' : 'border-gray-200'
      } ${isUploading ? 'animate-pulse' : ''} ${
        hasError ? 'border-red-300 bg-red-50' : ''
      } ${isDragging ? 'opacity-40 scale-95 shadow-xl z-30' : ''} ${
        isOver && !isDragging ? 'border-blue-400 border-2 scale-[1.02]' : ''
      } transition-all duration-200 ease-in-out`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        title="Drag to reorder"
      >
        {/* Visual drag indicator */}
        <div className="absolute top-2 left-2 z-50">
          <GripVertical className="h-5 w-5 text-white bg-black/60 rounded p-1 shadow-sm hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Image Container */}
      <div className="aspect-square relative bg-gray-50">
        {/* Loading/Uploading State */}
        {isUploading && (
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center z-20">
            <div className="text-center p-4">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                <Upload className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Uploading...
              </p>
              <p className="text-xs text-blue-600 truncate max-w-full px-2">
                {getFileName()}
              </p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {hasError && !isUploading && (
          <div className="absolute inset-0 bg-linear-to-br from-red-50 to-red-100 flex flex-col items-center justify-center z-20 p-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-sm font-medium text-red-700 text-center mb-2">
              Image failed to load
            </p>
            <p className="text-xs text-red-600 text-center mb-3">
              {isBlob
                ? 'Preview could not be generated'
                : 'Image could not be loaded'}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetryImage}
                className="text-xs"
              >
                Retry
              </Button>
              {isNew && onDeleteNewImage && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const newImageIndex = newImages.findIndex(
                      (img) => img?.previewUrl === imageUrl
                    )
                    if (newImageIndex !== -1) {
                      onDeleteNewImage(newImageIndex)
                    }
                  }}
                  className="text-xs"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Image Display */}
        {!isUploading && !hasError && (
          <div className="w-full h-full">
            <img
              src={currentDisplayUrl}
              alt={`Property image ${index + 1}`}
              className={`w-full h-full object-cover transition-all duration-200 ${
                isMarkedForDeletion ? 'opacity-40 grayscale' : 'opacity-100'
              } ${isNew ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}
              onError={handleImageError}
              loading="lazy"
              onLoad={() => setHasError(false)}
            />

            {/* Fallback for very short data URLs */}
            {currentDisplayUrl.startsWith('data:') &&
              currentDisplayUrl.length < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <FileImage className="w-8 h-8 text-gray-400" />
                </div>
              )}
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          {/* Main Image Badge */}
          {isMainImage && (
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3" />
              <span className="hidden sm:inline">Main</span>
            </div>
          )}

          {/* New/Unsaved Badge */}
          {isNew && !isUploading && (
            <div className="bg-linear-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ImageIcon className="w-3 h-3" />
              <span className="hidden sm:inline">New</span>
            </div>
          )}

          {/* Uploading Badge */}
          {isUploading && (
            <div className="bg-linear-to-r from-yellow-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Clock className="w-3 h-3 animate-pulse" />
              <span className="hidden sm:inline">Uploading</span>
            </div>
          )}
        </div>

        {/* Index Badge */}
        {!hasError && !isUploading && (
          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-sm">
            {index + 1}
          </div>
        )}

        {/* File Size/Info for New Images */}
        {isNew && !isUploading && !hasError && (
          <div className="absolute bottom-2 right-2">
            {getFileSize() && (
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded shadow-sm">
                {getFileSize()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Overlay */}
      {!isUploading && !hasError && !isDraggingOverlay && (
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end justify-center gap-2 opacity-0 group-hover:opacity-100 pb-4">
          <div className="flex px-2">
            {!isMainImage && !isNew && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      aria-label="Set main"
                      onClick={() => onSetAsMain(imageUrl)}
                      className="bg-white cursor-pointer relative z-50 text-gray-800 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform"
                    >
                      <Star className="w-4 h-4" />
                      {/* Set Mains */}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs text-white">Set as Main</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="px-2 gap-1 flex mx-auto">
              {isNew && onSetNewAsMain && !isMainImage && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newImageIndex = newImages.findIndex(
                            (img) => img?.previewUrl === imageUrl
                          )
                          if (newImageIndex !== -1) {
                            onSetNewAsMain(newImageIndex)
                          }
                        }}
                        className="bg-white text-md text-gray-800 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform cursor-pointer relative z-50"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-white text-xs">Set as Main</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Delete Button for existing images */}
              {!isNew && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={
                          isMarkedForDeletion ? 'default' : 'destructive'
                        }
                        onClick={() => onDeleteImage(imageUrl)}
                        className={
                          isMarkedForDeletion
                            ? 'bg-gray-600 hover:bg-gray-700 shadow-lg transform hover:scale-105 transition-transform cursor-pointer relative z-50'
                            : 'shadow-lg transform hover:scale-105 transition-transform cursor-pointer relative z-50'
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                        {isMarkedForDeletion ? 'Undo' : ''}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-white text-xs">
                        {isMarkedForDeletion ? 'Restore' : 'Delete'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Delete Button for new images */}
              {isNew && onDeleteNewImage && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const newImageIndex = newImages.findIndex(
                            (img) => img?.previewUrl === imageUrl
                          )
                          if (newImageIndex !== -1) {
                            onDeleteNewImage(newImageIndex)
                          }
                        }}
                        className="shadow-lg transform hover:scale-105 transition-transform cursor-pointer relative z-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-white text-xs">Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deletion Overlay for existing images */}
      {isMarkedForDeletion && !isNew && !hasError && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-20">
          <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium shadow-lg">
            To be deleted
          </div>
        </div>
      )}

      {/* Drop indicator */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg" />
      )}
    </div>
  )
}
