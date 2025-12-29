// components/property/ImageManager.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import { GripVertical, Image as ImageIcon, Move } from 'lucide-react'

import { SortableItem } from './SortableItem'

interface ImageManagerProps {
  existingImages: string[]
  imagesToDelete: string[]
  newImages?: Array<{
    file: File
    previewUrl: string
  }>
  uploadingImages?: string[]
  onDeleteImage: (imageUrl: string) => void
  onDeleteNewImage?: (fileIndex: number) => void
  onSetAsMain: (imageUrl: string) => void
  onSetNewAsMain?: (fileIndex: number) => void
  onReorder: (newOrder: string[]) => void
  onReorderNewImages?: (
    newOrder: Array<{ file: File; previewUrl: string }>
  ) => void
  isUploading?: boolean
}

// Helper function to convert blob URL to data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Create a unique ID for each image
const generateId = (imageUrl: string | undefined, index: number): string => {
  if (!imageUrl) return `image-${Date.now()}-${index}`
  return `image-${btoa(imageUrl).substring(0, 20)}-${index}`
}

export default function ImageManager({
  existingImages = [],
  imagesToDelete = [],
  newImages = [],
  uploadingImages = [],
  onDeleteImage,
  onDeleteNewImage,
  onSetAsMain,
  onSetNewAsMain,
  onReorder,
  onReorderNewImages,
  isUploading = false,
}: ImageManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [dataUrls, setDataUrls] = useState<Map<string, string>>(new Map())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const mountedRef = useRef(true)

  // Helper functions - DECLARED BEFORE USE
  const isBlobUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false
    return url.startsWith('blob:')
  }

  const isNewImage = (imageUrl: string | undefined) => {
    if (!imageUrl) return false
    return (
      newImages.some((img) => img?.previewUrl === imageUrl) ||
      uploadingImages.includes(imageUrl)
    )
  }

  const isUploadingImage = (imageUrl: string | undefined) => {
    if (!imageUrl) return false
    return uploadingImages.includes(imageUrl)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      dataUrls.forEach((dataUrl) => {
        if (dataUrl.startsWith('data:')) {
          // Data URLs don't need to be revoked
        }
      })
    }
  }, [])

  // Convert blob URLs to data URLs for more reliable display
  useEffect(() => {
    const convertBlobUrls = async () => {
      const newDataUrls = new Map<string, string>()

      for (const newImage of newImages) {
        if (
          newImage?.previewUrl &&
          typeof newImage.previewUrl === 'string' &&
          newImage.previewUrl.startsWith('blob:')
        ) {
          try {
            const response = await fetch(newImage.previewUrl)
            const blob = await response.blob()
            const dataUrl = await blobToDataURL(blob)

            if (mountedRef.current) {
              newDataUrls.set(newImage.previewUrl, dataUrl)
            }
          } catch (error) {
            console.warn('Failed to convert blob to data URL:', error)
          }
        }
      }

      if (mountedRef.current) {
        setDataUrls((prev) => {
          const merged = new Map(prev)
          newDataUrls.forEach((value, key) => merged.set(key, value))
          return merged
        })
      }
    }

    if (newImages.length > 0) {
      convertBlobUrls()
    }
  }, [newImages])

  // Combine all images for display, filtering out undefined/null
  const allImages = useMemo(
    () =>
      [
        ...(Array.isArray(existingImages)
          ? existingImages.filter((img) => img && !imagesToDelete.includes(img))
          : []),
        ...(Array.isArray(newImages)
          ? newImages.map((img) => img?.previewUrl).filter(Boolean)
          : []),
        ...(Array.isArray(uploadingImages)
          ? uploadingImages.filter(Boolean)
          : []),
      ].filter(Boolean) as string[],
    [existingImages, imagesToDelete, newImages, uploadingImages]
  )

  // Generate IDs for all images
  const itemIds = useMemo(
    () => allImages.map((img, index) => generateId(img, index)),
    [allImages]
  )

  // Find image by ID
  const findImageById = (id: string): string | undefined => {
    const index = itemIds.findIndex((itemId) => itemId === id)
    return index !== -1 ? allImages[index] : undefined
  }

  // Get active image data for overlay - NOW CAN USE isBlobUrl
  const activeImage = activeId ? findImageById(activeId) : null
  const activeDisplayUrl = activeImage
    ? isBlobUrl(activeImage) && dataUrls.has(activeImage)
      ? dataUrls.get(activeImage)!
      : activeImage
    : ''

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    // Optional: Add any visual feedback during drag if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setIsDragging(false)

    if (over && active.id !== over.id && active.id && over.id) {
      const activeIndex = itemIds.findIndex((id) => id === active.id)
      const overIndex = itemIds.findIndex((id) => id === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        const activeImageUrl = allImages[activeIndex]
        const overImageUrl = allImages[overIndex]

        // Check if both images are existing (saved) images
        const isActiveExisting = existingImages.includes(activeImageUrl)
        const isOverExisting = existingImages.includes(overImageUrl)

        // Check if both images are new (unsaved) images
        const activeNewImageIndex = newImages.findIndex(
          (img) => img?.previewUrl === activeImageUrl
        )
        const overNewImageIndex = newImages.findIndex(
          (img) => img?.previewUrl === overImageUrl
        )

        if (isActiveExisting && isOverExisting) {
          // Reorder existing images
          const oldIndex = existingImages.findIndex(
            (img) => img === activeImageUrl
          )
          const newIndex = existingImages.findIndex(
            (img) => img === overImageUrl
          )

          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(existingImages, oldIndex, newIndex)
            onReorder(newOrder)
          }
        } else if (
          activeNewImageIndex !== -1 &&
          overNewImageIndex !== -1 &&
          onReorderNewImages
        ) {
          // Reorder new images
          const newOrder = arrayMove(
            newImages,
            activeNewImageIndex,
            overNewImageIndex
          )
          onReorderNewImages(newOrder)
        } else {
          // Cross-reordering between existing and new
          const combinedArray = [
            ...existingImages.filter(
              (img) => img && !imagesToDelete.includes(img)
            ),
            ...newImages.map((img) => img.previewUrl),
          ]
          const combinedActiveIndex = combinedArray.findIndex(
            (img) => img === activeImageUrl
          )
          const combinedOverIndex = combinedArray.findIndex(
            (img) => img === overImageUrl
          )

          if (combinedActiveIndex !== -1 && combinedOverIndex !== -1) {
            const newCombinedOrder = arrayMove(
              combinedArray,
              combinedActiveIndex,
              combinedOverIndex
            )

            // Split back into existing and new
            const newExistingOrder = newCombinedOrder.filter((img) =>
              existingImages.includes(img)
            )
            const newNewImages = newCombinedOrder
              .map((img) =>
                newImages.find((newImg) => newImg?.previewUrl === img)
              )
              .filter(Boolean)

            onReorder(newExistingOrder)
            if (onReorderNewImages) {
              onReorderNewImages(
                newNewImages as Array<{ file: File; previewUrl: string }>
              )
            }
          }
        }
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setIsDragging(false)
  }

  // Convert blob URLs to data URLs for more reliable display
  useEffect(() => {
    const convertBlobUrls = async () => {
      const newDataUrls = new Map<string, string>()

      for (const newImage of newImages) {
        if (
          newImage?.previewUrl &&
          typeof newImage.previewUrl === 'string' &&
          newImage.previewUrl.startsWith('blob:') &&
          !dataUrls.has(newImage.previewUrl)
        ) {
          try {
            // Create a fresh blob URL from the file
            const blob = new Blob([newImage.file], { type: newImage.file.type })
            const newBlobUrl = URL.createObjectURL(blob)

            if (mountedRef.current) {
              newDataUrls.set(newImage.previewUrl, newBlobUrl)
            }
          } catch (error) {
            console.warn('Failed to create blob URL from file:', error)
            // If we can't create a blob URL, try to create a data URL as fallback
            try {
              const reader = new FileReader()
              const dataUrl = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(newImage.file)
              })

              if (mountedRef.current) {
                newDataUrls.set(newImage.previewUrl, dataUrl)
              }
            } catch (readerError) {
              console.warn('Failed to create data URL:', readerError)
            }
          }
        }
      }

      if (mountedRef.current && newDataUrls.size > 0) {
        setDataUrls((prev) => {
          const merged = new Map(prev)
          newDataUrls.forEach((value, key) => merged.set(key, value))
          return merged
        })
      }
    }

    if (newImages.length > 0) {
      convertBlobUrls()
    }
  }, [newImages, dataUrls])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="space-y-4">
          {/* Drag Instructions */}
          {isDragging && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Move className="w-4 h-4 animate-bounce" />
                <span>Drag the image to your desired position and release</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {allImages.length === 0 ? (
              <div className="col-span-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">
                  No images yet
                </p>
                <p className="text-sm text-gray-500">
                  Upload some images to get started
                </p>
              </div>
            ) : (
              allImages.map((imageUrl, index) => {
                const id = itemIds[index]
                const displayUrl =
                  isBlobUrl(imageUrl) && dataUrls.has(imageUrl)
                    ? dataUrls.get(imageUrl)!
                    : imageUrl
                const isMarkedForDeletion = imagesToDelete.includes(imageUrl)
                const isMainImage = index === 0
                const isNew = isNewImage(imageUrl)
                const isUploading = isUploadingImage(imageUrl)
                const isFailed = failedImages.has(imageUrl)
                const isBlob = isBlobUrl(imageUrl)

                if (!displayUrl) return null

                return (
                  <SortableItem
                    key={id}
                    id={id}
                    imageUrl={imageUrl}
                    displayUrl={displayUrl}
                    index={index}
                    isMainImage={isMainImage}
                    isNew={isNew}
                    isUploading={isUploading}
                    isFailed={isFailed}
                    isMarkedForDeletion={isMarkedForDeletion}
                    isBlob={isBlob}
                    onDeleteImage={onDeleteImage}
                    onDeleteNewImage={onDeleteNewImage}
                    onSetAsMain={onSetAsMain}
                    onSetNewAsMain={onSetNewAsMain}
                    newImages={newImages}
                    failedImages={failedImages}
                    setFailedImages={setFailedImages}
                    dataUrls={dataUrls}
                    setDataUrls={setDataUrls}
                    isDraggingOverlay={isDragging}
                  />
                )
              })
            )}
          </div>

          {/* Drag overlay for better UX */}
          <DragOverlay dropAnimation={null}>
            {activeId && activeDisplayUrl ? (
              <div className="border-2 border-blue-500 rounded-lg overflow-hidden shadow-2xl transform rotate-2 scale-105 cursor-grabbing">
                <div className="aspect-square relative bg-gray-50">
                  <img
                    src={activeDisplayUrl}
                    alt="Dragging"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-blue-500/10" />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    <GripVertical className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Moving...
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>

          {/* Stats and Status Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-linear-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-50">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                  <span className="font-medium">
                    Total: {allImages.length} image
                    {allImages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {existingImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    <span>
                      Saved: {existingImages.filter((img) => img).length}
                    </span>
                  </div>
                )}

                {newImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-300 rounded-full" />
                    <span>
                      New: {newImages.filter((img) => img?.previewUrl).length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-right">
              <div className="text-xs text-gray-500">
                First image is the main property photo
              </div>
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
