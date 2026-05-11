'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ProductImageProps {
  productId?: number
  image?: string
  alt: string
  className?: string
}

export function ProductImage({ productId, image, alt, className }: ProductImageProps) {
  const getInitialSrc = () => {
    if (image) {
      // If image is a full URL, use it directly
      if (image.startsWith('http')) {
        return image
      }
      // Otherwise, construct Supabase URL
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${image}`
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
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
