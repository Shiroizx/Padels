'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'

interface UploadOrderPaymentProofProps {
  orderId: number
}

export function UploadOrderPaymentProof({ orderId }: UploadOrderPaymentProofProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File terlalu besar', {
          description: 'Maksimal ukuran file 5MB',
        })
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('Format file tidak valid', {
          description: 'Hanya menerima file gambar (JPEG, PNG, GIF, WebP)',
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename (lowercase extension for consistency)
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
      const fileName = `order-${orderId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Update order with payment proof path
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_proof: filePath })
        .eq('id', orderId)

      if (updateError) throw updateError

      toast.success('Bukti pembayaran berhasil diupload!', {
        description: 'Menunggu konfirmasi dari admin',
      })

      router.refresh()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Upload gagal', {
        description: error.message || 'Terjadi kesalahan saat upload',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="payment_proof">Upload Bukti Pembayaran</Label>
        <Input
          id="payment_proof"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <p className="text-xs text-gray-500">
          Format: JPEG, PNG, GIF, WebP. Maksimal 5MB
        </p>
      </div>

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bukti Pembayaran
          </>
        )}
      </Button>
    </div>
  )
}
