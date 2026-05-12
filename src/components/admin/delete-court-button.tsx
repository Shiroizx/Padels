'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteCourtButtonProps {
  courtId: number
  courtName: string
}

export function DeleteCourtButton({ courtId, courtName }: DeleteCourtButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', courtId)

      if (error) throw error

      toast.success('Lapangan berhasil dihapus!', {
        description: `${courtName} telah dihapus dari database`,
      })

      router.push('/admin/courts')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus'
      console.error('Delete error:', error)
      toast.error('Gagal menghapus lapangan', {
        description: errorMessage,
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
          Ya, Hapus Lapangan
        </>
      )}
    </Button>
  )
}
