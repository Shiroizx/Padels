'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { courtSchema } from '@/lib/utils/validation'
import Image from 'next/image'

type CourtFormData = z.infer<typeof courtSchema>

interface CourtFormProps {
  mode: 'create' | 'edit'
  court?: any
}

export function CourtForm({ mode, court }: CourtFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    court?.images || []
  )
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: mode === 'edit' && court ? {
      name: court.name,
      description: court.description || '',
      price_per_hour: court.price_per_hour,
      location: court.location || '',
      is_available: court.is_available,
    } : {
      name: '',
      description: '',
      price_per_hour: 0,
      location: '',
      is_available: true,
    },
  })

  const isAvailable = watch('is_available')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} terlalu besar (max 5MB)`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bukan file gambar`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setImageFiles(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (courtId: number) => {
    if (imageFiles.length === 0) return []

    setIsUploading(true)
    const uploadedFilenames: string[] = []

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `court-${courtId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('court-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Store filename only, not full URL
        uploadedFilenames.push(fileName)
      }

      return uploadedFilenames
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Gagal upload gambar', {
        description: error.message,
      })
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: CourtFormData) => {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        // Create court first
        const { data: newCourt, error } = await supabase
          .from('courts')
          .insert({
            name: data.name,
            description: data.description,
            price_per_hour: data.price_per_hour,
            location: data.location,
            is_available: data.is_available,
          })
          .select()
          .single()

        if (error) throw error

        // Upload images if any
        if (imageFiles.length > 0) {
          const uploadedFilenames = await uploadImages(newCourt.id)
          
          if (uploadedFilenames.length > 0) {
            // Save first image filename to 'image' column (singular)
            await supabase
              .from('courts')
              .update({ image: uploadedFilenames[0] })
              .eq('id', newCourt.id)
          }
        }

        toast.success('Lapangan berhasil ditambahkan!')
      } else {
        // Upload new images if any
        let imageFilename = court.image // Keep existing image
        
        if (imageFiles.length > 0) {
          const uploadedFilenames = await uploadImages(court.id)
          if (uploadedFilenames.length > 0) {
            // Use first uploaded image filename
            imageFilename = uploadedFilenames[0]
          }
        }

        // Update court
        const { error } = await supabase
          .from('courts')
          .update({
            name: data.name,
            description: data.description,
            price_per_hour: data.price_per_hour,
            location: data.location,
            is_available: data.is_available,
            image: imageFilename, // Save filename only, not full URL
          })
          .eq('id', court.id)

        if (error) throw error

        toast.success('Lapangan berhasil diupdate!')
      }

      router.push('/admin/courts')
      router.refresh()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(mode === 'create' ? 'Gagal menambahkan lapangan' : 'Gagal mengupdate lapangan', {
        description: error.message || 'Terjadi kesalahan',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Lapangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lapangan *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Contoh: Lapangan A"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Contoh: Lantai 2, Gedung Utama"
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_hour">Harga per Jam (Rp) *</Label>
            <Input
              id="price_per_hour"
              type="number"
              {...register('price_per_hour', { valueAsNumber: true })}
              placeholder="100000"
            />
            {errors.price_per_hour && (
              <p className="text-sm text-red-600">{errors.price_per_hour.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Deskripsi lapangan, fasilitas, dll"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Gambar Lapangan</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isSubmitting || isUploading}
            />
            <p className="text-xs text-gray-500">
              Upload gambar lapangan (max 5MB per file, format: JPG, PNG, WebP)
            </p>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_available">Status Ketersediaan *</Label>
            <Select
              value={isAvailable ? 'true' : 'false'}
              onValueChange={(value) => setValue('is_available', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Tersedia</SelectItem>
                <SelectItem value="false">Tidak Tersedia</SelectItem>
              </SelectContent>
            </Select>
            {errors.is_available && (
              <p className="text-sm text-red-600">{errors.is_available.message}</p>
            )}
          </div>

          <div className="flex gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/courts')}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading gambar...' : mode === 'create' ? 'Menambahkan...' : 'Mengupdate...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Tambah Lapangan
                    </>
                  ) : (
                    'Update Lapangan'
                  )}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
