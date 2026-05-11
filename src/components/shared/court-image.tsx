'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CourtImageProps {
  courtId?: number
  image?: string | string[] // Support both single image and array
  images?: string[] // Deprecated, use 'image' instead
  alt: string
  className?: string
}

export function CourtImage({ courtId, image, images, alt, className }: CourtImageProps) {
  // Get first image from array or single image
  const getInitialSrc = () => {
    // Priority: image prop > images prop
    if (image) {
      if (Array.isArray(image) && image.length > 0 && image[0]) {
        // If image is array, get first item
        const firstImage = image[0]
        if (firstImage && firstImage.trim() !== '') {
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/court-images/${firstImage}`
        }
      } else if (typeof image === 'string' && image.trim() !== '') {
        // If image is string
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/court-images/${image}`
      }
    }
    
    // Fallback to images prop (deprecated)
    if (images && images.length > 0 && images[0] && images[0].trim() !== '') {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/court-images/${images[0]}`
    }
    
    return null
  }

  const [imgSrc, setImgSrc] = useState<string | null>(getInitialSrc())
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(null)
    }
  }

  // Show placeholder if no image
  if (!imgSrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No Image</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      onError={handleError}
    />
  )
}
