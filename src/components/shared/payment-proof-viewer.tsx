'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Download } from 'lucide-react'
import Image from 'next/image'

interface PaymentProofViewerProps {
  imageUrl: string
  alt?: string
}

export function PaymentProofViewer({ imageUrl, alt = 'Bukti Pembayaran' }: PaymentProofViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `bukti-pembayaran-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="group relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-gray-100 transition-all group-hover:border-blue-500">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain transition-transform group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
            <div className="rounded-full bg-white p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <Eye className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500 group-hover:text-blue-600">
          Klik untuk memperbesar
        </p>
      </div>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bukti Pembayaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border bg-gray-100">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
