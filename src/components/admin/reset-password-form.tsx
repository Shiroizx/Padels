'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

export function ResetPasswordForm({ user }: { user: User }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const generateRandomPassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({
      newPassword: password,
      confirmPassword: password,
    })
    toast.success('Password acak berhasil dibuat!', {
      description: 'Jangan lupa untuk menyalin password ini',
    })
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.newPassword)
      setCopied(true)
      toast.success('Password berhasil disalin!', {
        description: 'Password telah disalin ke clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Gagal menyalin password')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Password tidak cocok', {
          description: 'Pastikan password dan konfirmasi password sama',
        })
        setIsLoading(false)
        return
      }

      // Validate password length
      if (formData.newPassword.length < 6) {
        toast.error('Password terlalu pendek', {
          description: 'Password minimal 6 karakter',
        })
        setIsLoading(false)
        return
      }

      // Call API route to reset password
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal reset password')
      }

      toast.success('Password berhasil direset!', {
        description: `Password untuk ${user.email} telah diubah`,
      })

      // Show password one more time before redirect
      setTimeout(() => {
        router.push('/admin/users')
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      toast.error('Gagal reset password', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Info */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm font-semibold text-blue-900">User yang akan direset:</p>
        <div className="mt-2 space-y-1 text-sm text-blue-700">
          <p>Nama: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>

      {/* Generate Random Password Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={generateRandomPassword}
          disabled={isLoading}
          className="w-full"
        >
          Generate Password Acak
        </Button>
        <p className="mt-2 text-xs text-gray-500">
          Klik untuk membuat password acak yang aman
        </p>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          Password Baru <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Masukkan password baru"
            required
            disabled={isLoading}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {formData.newPassword && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPassword}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-8 w-8 p-0"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Minimal 6 karakter
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Konfirmasi Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Masukkan ulang password baru"
            required
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Password Match Indicator */}
      {formData.newPassword && formData.confirmPassword && (
        <div className={`rounded-lg p-3 text-sm ${
          formData.newPassword === formData.confirmPassword
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {formData.newPassword === formData.confirmPassword ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Password cocok
            </div>
          ) : (
            '❌ Password tidak cocok'
          )}
        </div>
      )}

      {/* Warning */}
      <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
        <p className="text-sm font-semibold text-yellow-900">⚠️ Penting!</p>
        <p className="text-sm text-yellow-700 mt-1">
          Pastikan untuk menyalin dan memberitahu password baru kepada user. Password tidak dapat dilihat lagi setelah halaman ini ditutup.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={isLoading || formData.newPassword !== formData.confirmPassword} 
          className="flex-1 bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mereset Password...
            </>
          ) : (
            'Reset Password'
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
