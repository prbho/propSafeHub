'use client'

import { useCallback, useState } from 'react'
import { RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react'
import Cropper, { Area } from 'react-easy-crop'
import { toast } from 'sonner'

interface ImageCropperModalProps {
  image: string
  onClose: () => void
  onCropComplete: (croppedImage: Blob) => void
  aspectRatio?: number
}

export default function ImageCropperModal({
  image,
  onClose,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  console.log(
    '🖼️ ImageCropperModal received image URL:',
    image?.substring?.(0, 100)
  )

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => {
        console.log('✅ Image loaded in createImage')
        resolve(image)
      })
      image.addEventListener('error', (error) => {
        console.error('❌ Error loading image in createImage:', error)
        reject(error)
      })
      // For blob URLs, crossOrigin might not be needed
      // image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    try {
      console.log('✂️ Starting crop process...')
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

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('✅ Crop successful, blob size:', blob.size)
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob from canvas'))
            }
          },
          'image/jpeg',
          0.95
        )
      })
    } catch (error) {
      console.error('❌ Error in getCroppedImg:', error)
      throw error
    }
  }

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) {
      toast.error('Please select a crop area first')
      return
    }

    setIsProcessing(true)
    try {
      console.log('🚀 Starting crop process...')
      const croppedImageBlob = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )
      console.log('✅ Crop completed successfully')
      onCropComplete(croppedImageBlob)
      onClose()
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Crop Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div
          className="relative flex-grow min-h-[400px] bg-black"
          style={{ height: '400px' }}
        >
          {/* Debug info */}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-75 z-10">
            {image ? 'Image URL loaded' : 'No image'}
          </div>

          {image ? (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropAreaChange}
              onRotationChange={setRotation}
              showGrid={true}
              restrictPosition={false}
              style={{
                containerStyle: {
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000',
                },
                cropAreaStyle: {
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                },
                mediaStyle: {
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                },
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4">No image to display</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-4">
              <ZoomOut className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600"
              />
              <ZoomIn className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </div>

            {/* Rotation Control */}
            <div className="flex items-center gap-4">
              <RotateCw className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600"
              />
              <span className="text-sm text-gray-600 w-8 flex-shrink-0">
                {rotation}°
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={isProcessing || !croppedAreaPixels}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Apply Crop'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
