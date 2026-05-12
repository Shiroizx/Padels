'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { registerSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Trophy, Mail, Lock, User, ArrowLeft, CheckCircle, Zap, Shield } from 'lucide-react'

type RegisterForm = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (authError) throw authError

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        toast.success('Registrasi berhasil', {
          description: 'Silakan cek email Anda untuk konfirmasi akun.',
        })
      } else {
        toast.success('Registrasi berhasil', {
          description: 'Akun Anda telah dibuat. Silakan login.',
        })
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat akun'
      console.error('Registration error:', error)
      toast.error('Registrasi gagal', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Back to Home */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Home
          </Button>
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Padels</h1>
                    <p className="text-sm text-gray-600">Platform Booking Terbaik</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-bold leading-tight text-gray-900">
                    Mulai Perjalanan
                    <br />
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Olahraga Anda!
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600">
                    Daftar sekarang dan nikmati kemudahan booking lapangan serta belanja produk olahraga.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Gratis Selamanya</p>
                      <p className="text-sm text-gray-600">Tanpa biaya pendaftaran</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Booking Instan</p>
                      <p className="text-sm text-gray-600">Konfirmasi langsung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Aman & Terpercaya</p>
                      <p className="text-sm text-gray-600">Data Anda terlindungi</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">100+</div>
                    <div className="text-xs text-green-700">Booking</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">50+</div>
                    <div className="text-xs text-green-700">Member</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">4.9</div>
                    <div className="text-xs text-green-700">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md border-2 shadow-xl">
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 lg:hidden">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Daftar Akun</CardTitle>
                    <CardDescription className="mt-2">
                      Isi form di bawah untuk membuat akun baru
                    </CardDescription>
                  </div>
                  <Badge className="mx-auto bg-green-100 text-green-700 hover:bg-green-200" variant="secondary">
                    ✨ Gratis & Cepat
                  </Badge>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Lengkap
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          {...register('name')}
                          placeholder="John Doe"
                          disabled={isLoading}
                          className="pl-10"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="email@example.com"
                          disabled={isLoading}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation" className="text-sm font-medium">
                        Konfirmasi Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password_confirmation"
                          type="password"
                          {...register('password_confirmation')}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="pl-10"
                        />
                      </div>
                      {errors.password_confirmation && (
                        <p className="text-sm text-red-600">{errors.password_confirmation.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Daftar Sekarang'
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Atau</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link
                          href="/login"
                          className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                        >
                          Login di sini
                        </Link>
                      </p>
                    </div>
                  </form>

                  {/* Terms */}
                  <div className="mt-6 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-600 text-center">
                      Dengan mendaftar, Anda menyetujui{' '}
                      <span className="font-medium text-gray-900">Syarat & Ketentuan</span> serta{' '}
                      <span className="font-medium text-gray-900">Kebijakan Privasi</span> kami.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
