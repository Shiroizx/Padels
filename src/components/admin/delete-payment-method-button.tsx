'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

interface DeletePaymentMethodButtonProps {
  paymentMethodId: number
  qrCodeImage?: string | null
}

export function DeletePaymentMethodButton({ paymentMethodId, qrCodeImage }: DeletePaymentMethodButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
      return
    }

    setIsDeleting(true)

    try {
      // Delete QR code image if exists
      if (qrCodeImage) {
        const { error: storageError } = await supabase.storage
          .from('qr-codes')
          .remove([qrCodeImage])

        if (storageError) {
          console.error('Failed to delete QR code:', storageError)
        }
      }

      // Delete payment method
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)

      if (error) throw error

      toast.success('Metode pembayaran berhasil dihapus!')
      router.push('/admin/payment-methods')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus metode pembayaran'
      console.error('Delete error:', error)
      toast.error('Gagal menghapus metode pembayaran', {
        description: errorMessage,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="destructive"
      className="flex-1"
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menghapus...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Metode
        </>
      )}
    </Button>
  )
}
