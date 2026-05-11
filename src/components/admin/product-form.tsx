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
import { productSchema } from '@/lib/utils/validation'
import Image from 'next/image'

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  mode: 'create' | 'edit'
  product?: any
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image}` : null
  )
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: mode === 'edit' && product ? {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      is_available: product.is_available,
    } : {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      is_available: true,
    },
  })

  const isAvailable = watch('is_available')
  const category = watch('category')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File terlalu besar (max 5MB)')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const uploadImage = async (productId: number) => {
    if (!imageFile) return null

    setIsUploading(true)

    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `product-${productId}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      return fileName
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Gagal upload gambar', {
        description: error.message,
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        // Create product first
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            is_available: data.is_available,
          })
          .select()
          .single()

        if (error) throw error

        // Upload image if any
        if (imageFile) {
          const imagePath = await uploadImage(newProduct.id)
          
          if (imagePath) {
            await supabase
              .from('products')
              .update({ image: imagePath })
              .eq('id', newProduct.id)
          }
        }

        toast.success('Produk berhasil ditambahkan!')
      } else {
        // Upload new image if any
        let imagePath = product.image
        
        if (imageFile) {
          const newImagePath = await uploadImage(product.id)
          if (newImagePath) {
            imagePath = newImagePath
          }
        }

        // Update product
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            is_available: data.is_available,
            image: imagePath,
          })
          .eq('id', product.id)

        if (error) throw error

        toast.success('Produk berhasil diupdate!')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(mode === 'create' ? 'Gagal menambahkan produk' : 'Gagal mengupdate produk', {
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
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Contoh: Raket Padel Pro"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Raket">Raket</SelectItem>
                <SelectItem value="Bola">Bola</SelectItem>
                <SelectItem value="Sepatu">Sepatu</SelectItem>
                <SelectItem value="Tas">Tas</SelectItem>
                <SelectItem value="Aksesoris">Aksesoris</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="500000"
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.stock && (
                <p className="text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Deskripsi produk, spesifikasi, dll"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Gambar Produk</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting || isUploading}
            />
            <p className="text-xs text-gray-500">
              Upload gambar produk (max 5MB, format: JPG, PNG, WebP)
            </p>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mt-4 aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  disabled={isSubmitting || isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
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
              onClick={() => router.push('/admin/products')}
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
                      Tambah Produk
                    </>
                  ) : (
                    'Update Produk'
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
