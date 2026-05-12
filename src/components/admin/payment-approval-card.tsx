'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2, Calendar, Package, User } from 'lucide-react'
import Image from 'next/image'

interface OrderItem {
  quantity: number
}

interface PaymentData {
  id: string
  created_at?: string
  users?: { name?: string; email?: string } | null
  courts?: { name?: string } | null
  booking_date?: string
  start_time?: string
  end_time?: string
  price?: number
  customer_name?: string
  customer_address?: string
  total_amount?: number
  order_items?: OrderItem[]
}

interface PaymentApprovalCardProps {
  type: 'booking' | 'order'
  data: PaymentData
  paymentProofUrl: string | null
}

export function PaymentApprovalCard({ type, data, paymentProofUrl }: PaymentApprovalCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const handleApprove = async () => {
    setIsProcessing(true)

    try {
      const table = type === 'booking' ? 'bookings' : 'orders'
      const newStatus = type === 'booking' ? 'confirmed' : 'paid'

      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', data.id)

      if (error) throw error

      toast.success('Pembayaran berhasil diapprove!', {
        description: `${type === 'booking' ? 'Booking' : 'Order'} #${data.id} telah dikonfirmasi`,
      })

      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat approve pembayaran'
      console.error('Approve error:', error)
      toast.error('Approve gagal', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)

    try {
      const table = type === 'booking' ? 'bookings' : 'orders'

      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'cancelled',
          payment_proof: null 
        })
        .eq('id', data.id)

      if (error) throw error

      toast.success('Pembayaran ditolak', {
        description: `${type === 'booking' ? 'Booking' : 'Order'} #${data.id} telah dibatalkan`,
      })

      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat reject pembayaran'
      console.error('Reject error:', error)
      toast.error('Reject gagal', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {type === 'booking' ? (
                <>
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Booking #{data.id}
                </>
              ) : (
                <>
                  <Package className="mr-2 inline h-4 w-4" />
                  Order #{data.id}
                </>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {data.created_at ? formatDate(data.created_at) : '-'}
            </p>
          </div>
          <Badge variant="secondary">Pending</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="space-y-2 border-b pb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {data.customer_name || data.users?.name || '-'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{data.users?.email || '-'}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 border-b pb-4">
          {type === 'booking' ? (
            <>
              <p className="text-sm">
                <strong>Lapangan:</strong> {data.courts?.name || '-'}
              </p>
              <p className="text-sm">
                <strong>Tanggal:</strong> {data.booking_date ? formatDate(data.booking_date) : '-'}
              </p>
              <p className="text-sm">
                <strong>Waktu:</strong> {data.start_time && data.end_time ? `${formatTime(data.start_time)} - ${formatTime(data.end_time)}` : '-'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">
                <strong>Items:</strong> {data.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} produk
              </p>
              <p className="text-sm">
                <strong>Alamat:</strong> {data.customer_address || '-'}
              </p>
            </>
          )}
        </div>

        {/* Price */}
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(type === 'booking' ? (data.price || 0) : (data.total_amount || 0))}
          </div>
        </div>

        {/* Payment Proof */}
        {paymentProofUrl && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Bukti Pembayaran:</p>
            <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-gray-100">
              <Image
                src={paymentProofUrl}
                alt="Bukti Pembayaran"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
