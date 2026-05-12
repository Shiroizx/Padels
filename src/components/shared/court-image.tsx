'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CourtImageProps {
  imageUrl?: string | null
  image?: string | string[] // Support both single image and array
  images?: string[] // Deprecated, use 'image' instead
  alt: string
  className?: string
  priority?: boolean // For LCP optimization
}

export function CourtImage({ imageUrl, image, images, alt, className, priority = false }: CourtImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Get first image filename from array or single image
  const getImageFilename = () => {
    // Priority: imageUrl prop > image prop > images prop
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl
    }
    
    if (image) {
      if (Array.isArray(image) && image.length > 0 && image[0]) {
        const firstImage = image[0]
        if (firstImage && firstImage.trim() !== '') {
          return firstImage
        }
      } else if (typeof image === 'string' && image.trim() !== '') {
        return image
      }
    }
    
    // Fallback to images prop (deprecated)
    if (images && images.length > 0 && images[0] && images[0].trim() !== '') {
      return images[0]
    }
    
    return null
  }

  useEffect(() => {
    async function loadImage() {
      const filename = getImageFilename()
      
      if (!filename) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.storage
          .from('court-images')
          .createSignedUrl(filename, 3600) // 1 hour expiry
        
        if (error) {
          console.error('Failed to get signed URL:', error)
          setHasError(true)
        } else if (data?.signedUrl) {
          setImgSrc(data.signedUrl)
        }
      } catch (error) {
        console.error('Error loading image:', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imageUrl, image, images, supabase])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(null)
    }
  }

  // Show placeholder if loading, no image, or error
  if (isLoading || !imgSrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <div className="text-center">
          {isLoading ? (
            <svg
              className="mx-auto h-12 w-12 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized
    />
  )
}
