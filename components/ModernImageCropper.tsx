// components/ModernImageCropper.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { lockBodyScroll, unlockBodyScroll } from '@/utils/body-scroll-lock'
import {
  Check,
  Crop,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { toast } from 'sonner'

import { Slider } from '@/components/ui/slider'

import Portal from './Portal'

interface ModernImageCropperProps {
  image: string
  onClose: () => void
  onCropComplete: (croppedImage: Blob) => void
  aspectRatio?: number
}

export default function ModernImageCropper({
  image,
  onClose,
  onCropComplete,
  aspectRatio = 1,
}: ModernImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when cropper opens
  useEffect(() => {
    lockBodyScroll()

    // Prevent escape key from closing parent modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape, true) // Use capture phase

    return () => {
      unlockBodyScroll()
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [onClose])

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onRotationChange = (rotation: number) => {
    setRotation(rotation)
  }

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  // Helper functions
  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.max(prev - 0.1, 1))
  }

  const rotateLeft = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRotation((prev) => (prev - 90) % 360)
  }

  const rotateRight = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRotation((prev) => (prev + 90) % 360)
  }

  const resetTransform = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
    setRotation(0)
    setCrop({ x: 0, y: 0 })
    toast.success('Transformations reset')
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
        },
        'image/jpeg',
        0.92
      )
    })
  }

  const handleCropComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!croppedAreaPixels) {
      toast.error('Please select a crop area')
      return
    }

    setIsProcessing(true)

    try {
      const croppedImageBlob = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )

      // Use setTimeout to ensure the click event doesn't bubble
      setTimeout(() => {
        onCropComplete(croppedImageBlob)
        toast.success('Image cropped successfully!')
        onClose()
      }, 0)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle backdrop click - only close if clicked directly on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      e.stopPropagation()
      onClose()
    }
  }

  // Prevent any clicks inside the modal from bubbling
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
        onClick={handleBackdropClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          ref={modalRef}
          className="bg-linear-to-br from-gray-900 to-gray-950 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl"
          onClick={handleModalClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-linear-to-r from-gray-900 to-gray-950">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Crop className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Crop Profile Picture
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Adjust and crop your image. It will be saved to the form.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Image Cropper Area */}
            <div className="lg:w-2/3 p-6">
              <div className="relative h-96 lg:h-[500px] bg-linear-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-800">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropAreaChange}
                  objectFit="contain"
                  showGrid={true}
                  classes={{
                    containerClassName: '!rounded-xl',
                    cropAreaClassName:
                      '!border-2 !border-emerald-400/50 !shadow-lg',
                    mediaClassName: '!max-h-full !max-w-full',
                  }}
                  style={{
                    cropAreaStyle: {
                      border: '2px solid rgba(52, 211, 153, 0.3)',
                      boxShadow: '0 0 20px rgba(52, 211, 153, 0.1)',
                    },
                  }}
                />

                {/* Crop area indicator */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700">
                  <span className="text-xs text-emerald-300 font-medium">
                    Crop Area Selected
                  </span>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="lg:w-1/3 p-6 border-t lg:border-t-0 lg:border-l border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-950/50">
              <div className="space-y-8">
                {/* Aspect Ratio Info */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      Aspect Ratio
                    </span>
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded">
                      {aspectRatio}:1
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Perfect for profile pictures. The crop area is locked to a
                    square.
                  </p>
                </div>

                {/* Zoom Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">
                        Zoom
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400 font-mono">
                      {zoom.toFixed(1)}x
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={([value]) => onZoomChange(value)}
                      className="[[role=slider]]:bg-emerald-500 [[role=slider]]:border-emerald-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={zoomOut}
                        disabled={zoom <= 1}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all flex items-center justify-center gap-2"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Minus className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-300">Zoom Out</span>
                      </button>
                      <button
                        onClick={zoomIn}
                        disabled={zoom >= 3}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all flex items-center justify-center gap-2"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Plus className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-300">Zoom In</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rotation Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">
                        Rotation
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400 font-mono">
                      {rotation}°
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={([value]) => onRotationChange(value)}
                      className="[[role=slider]]:bg-emerald-500 [[role=slider]]:border-emerald-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={rotateLeft}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center gap-2"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <RotateCcw className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-300">Left</span>
                      </button>
                      <button
                        onClick={resetTransform}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center gap-2"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Minimize2 className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-300">Reset</span>
                      </button>
                      <button
                        onClick={rotateRight}
                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center gap-2"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <RotateCw className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-300">Right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <button
                    onClick={handleCropComplete}
                    disabled={isProcessing || !croppedAreaPixels}
                    className="w-full py-3 px-4 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-2 group"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        <span className="text-white font-medium">
                          Processing...
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white font-medium">
                          Apply Crop
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                    className="w-full py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Help Text */}
          <div className="p-4 border-t border-gray-800 bg-linear-to-r from-gray-900/50 to-transparent">
            <p className="text-xs text-gray-400 text-center">
              Drag to reposition • Scroll to zoom • Click Apply to save crop
            </p>
          </div>
        </div>
      </div>
    </Portal>
  )
}
