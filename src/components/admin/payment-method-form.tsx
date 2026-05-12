'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface PaymentMethod {
  id: number
  name: string
  type: string
  account_number?: string
  account_name?: string
  bank_name?: string
  qr_code_image?: string
  phone_number?: string
  instructions?: string
  is_active: boolean
  display_order: number
}

interface PaymentMethodFormProps {
  mode: 'create' | 'edit'
  paymentMethod?: PaymentMethod
}

export function PaymentMethodForm({ mode, paymentMethod }: PaymentMethodFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const [existingQrCodeUrl, setExistingQrCodeUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: mode === 'edit' && paymentMethod ? {
      name: paymentMethod.name,
      type: paymentMethod.type,
      account_number: paymentMethod.account_number || '',
      account_name: paymentMethod.account_name || '',
      bank_name: paymentMethod.bank_name || '',
      phone_number: paymentMethod.phone_number || '',
      instructions: paymentMethod.instructions || '',
      is_active: paymentMethod.is_active,
      display_order: paymentMethod.display_order,
    } : {
      name: '',
      type: 'bank_transfer',
      account_number: '',
      account_name: '',
      bank_name: '',
      phone_number: '',
      instructions: '',
      is_active: true,
      display_order: 0,
    },
  })

  const paymentType = watch('type')
  const isActive = watch('is_active')

  // Load existing QR code
  useEffect(() => {
    async function loadExistingQrCode() {
      if (mode === 'edit' && paymentMethod?.qr_code_image) {
        try {
          const { data, error } = await supabase.storage
            .from('qr-codes')
            .createSignedUrl(paymentMethod.qr_code_image, 3600)
          
          if (!error && data?.signedUrl) {
            setExistingQrCodeUrl(data.signedUrl)
          }
        } catch (error) {
          console.error('Failed to load existing QR code:', error)
        }
      }
    }
    loadExistingQrCode()
  }, [mode, paymentMethod?.qr_code_image, supabase])

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File terlalu besar (max 5MB)')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    setQrCodeFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setQrCodePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeQrCode = () => {
    setQrCodeFile(null)
    setQrCodePreview(null)
  }

  const uploadQrCode = async (methodId: number) => {
    if (!qrCodeFile) return null

    setIsUploading(true)

    try {
      const fileExt = qrCodeFile.name.split('.').pop()
      const fileName = `qr-${methodId}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(fileName, qrCodeFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      return fileName
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Upload error:', error)
      toast.error('Gagal upload QR code', {
        description: errorMessage,
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const { data: newMethod, error } = await supabase
          .from('payment_methods')
          .insert({
            name: data.name,
            type: data.type,
            account_number: data.account_number || null,
            account_name: data.account_name || null,
            bank_name: data.bank_name || null,
            phone_number: data.phone_number || null,
            instructions: data.instructions || null,
            is_active: data.is_active,
            display_order: data.display_order,
          })
          .select()
          .single()

        if (error) throw error

        if (qrCodeFile) {
          const qrCodePath = await uploadQrCode(newMethod.id)
          
          if (qrCodePath) {
            await supabase
              .from('payment_methods')
              .update({ qr_code_image: qrCodePath })
              .eq('id', newMethod.id)
          }
        }

        toast.success('Metode pembayaran berhasil ditambahkan!')
      } else {
        let qrCodePath = paymentMethod?.qr_code_image
        
        if (qrCodeFile && paymentMethod) {
          const newQrCodePath = await uploadQrCode(paymentMethod.id)
          if (newQrCodePath) {
            qrCodePath = newQrCodePath
          }
        }

        if (!paymentMethod) throw new Error('Payment method not found')
        
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: data.name,
            type: data.type,
            account_number: data.account_number || null,
            account_name: data.account_name || null,
            bank_name: data.bank_name || null,
            phone_number: data.phone_number || null,
            instructions: data.instructions || null,
            is_active: data.is_active,
            display_order: data.display_order,
            qr_code_image: qrCodePath,
          })
          .eq('id', paymentMethod.id)

        if (error) throw error

        toast.success('Metode pembayaran berhasil diupdate!')
      }

      router.push('/admin/payment-methods')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      console.error('Submit error:', error)
      toast.error(mode === 'create' ? 'Gagal menambahkan metode pembayaran' : 'Gagal mengupdate metode pembayaran', {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Metode *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nama wajib diisi' })}
              placeholder="Contoh: Transfer Bank BCA"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe Pembayaran *</Label>
            <Select
              value={paymentType}
              onValueChange={(value) => setValue('type', value as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                <SelectItem value="e_wallet">E-Wallet</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === 'bank_transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Nama Bank *</Label>
                <Input
                  id="bank_name"
                  {...register('bank_name')}
                  placeholder="Contoh: BCA, Mandiri, BNI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Nomor Rekening *</Label>
                <Input
                  id="account_number"
                  {...register('account_number')}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_name">Atas Nama *</Label>
                <Input
                  id="account_name"
                  {...register('account_name')}
                  placeholder="PT Padel Court"
                />
              </div>
            </>
          )}

          {paymentType === 'e_wallet' && (
            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor HP</Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="081234567890"
              />
            </div>
          )}

          {paymentType === 'qris' && (
            <div className="space-y-2">
              <Label htmlFor="qr_code">QR Code</Label>
              <Input
                id="qr_code"
                type="file"
                accept="image/*"
                onChange={handleQrCodeChange}
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-gray-500">
                Upload gambar QR Code (max 5MB, format: JPG, PNG)
              </p>
              
              {mode === 'edit' && existingQrCodeUrl && !qrCodePreview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">QR Code Saat Ini:</p>
                  <div className="relative h-64 w-64 overflow-hidden rounded-lg border">
                    <Image
                      src={existingQrCodeUrl}
                      alt="Current QR Code"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              
              {qrCodePreview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">QR Code Baru:</p>
                  <div className="relative h-64 w-64 overflow-hidden rounded-lg border">
                    <Image
                      src={qrCodePreview}
                      alt="QR Code Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeQrCode}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instructions">Instruksi Pembayaran</Label>
            <Textarea
              id="instructions"
              {...register('instructions')}
              placeholder="Instruksi untuk customer, contoh: Transfer ke rekening dan upload bukti transfer"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Urutan Tampilan</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Semakin kecil angka, semakin atas posisinya
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Status *</Label>
            <Select
              value={isActive ? 'true' : 'false'}
              onValueChange={(value) => setValue('is_active', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/payment-methods')}
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
                  {isUploading ? 'Uploading...' : mode === 'create' ? 'Menambahkan...' : 'Mengupdate...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Tambah Metode
                    </>
                  ) : (
                    'Update Metode'
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
