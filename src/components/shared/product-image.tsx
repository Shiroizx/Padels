'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProductImageProps {
  image?: string
  alt: string
  className?: string
  priority?: boolean // For LCP optimization
}

export function ProductImage({ image, alt, className, priority = false }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadImage() {
      if (!image || image.trim() === '') {
        setIsLoading(false)
        return
      }

      // If image is already a full URL (signed URL), use it directly
      if (image.startsWith('http')) {
        setImgSrc(image)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .createSignedUrl(image, 3600) // 1 hour expiry
        
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
  }, [image, supabase])

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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
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
