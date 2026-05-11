'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteProductButtonProps {
  productId: number
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Produk berhasil dihapus!', {
        description: `${productName} telah dihapus dari database`,
      })

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Gagal menghapus produk', {
        description: error.message || 'Terjadi kesalahan saat menghapus',
      })
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
          Ya, Hapus Produk
        </>
      )}
    </Button>
  )
}
