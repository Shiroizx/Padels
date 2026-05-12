'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function EditUserForm({ user }: { user: User }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call API route to update user
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal update user')
      }

      // Show appropriate success message
      if (formData.email !== user.email && !data.emailUpdated) {
        toast.warning('User berhasil diupdate', {
          description: 'Namun email tidak dapat diubah. Gunakan Supabase Dashboard untuk mengubah email.',
        })
      } else {
        toast.success('User berhasil diupdate!', {
          description: 'Informasi user telah diperbarui',
        })
      }

      // Redirect and refresh
      router.push('/admin/users')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      toast.error('Gagal update user', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nama <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nama lengkap"
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Catatan: Perubahan email mungkin memerlukan verifikasi ulang
        </p>
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as string })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Admin memiliki akses penuh ke semua fitur
        </p>
      </div>

      {/* User Info */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm font-semibold text-blue-900">Informasi User</p>
        <div className="mt-2 space-y-1 text-sm text-blue-700">
          <p>User ID: {user.id}</p>
          <p>Email Asli: {user.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
