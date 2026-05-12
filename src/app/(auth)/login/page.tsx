'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Trophy, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      toast.success('Login berhasil', {
        description: 'Selamat datang kembali!',
      })

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email atau password salah'
      toast.error('Login gagal', {
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

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
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
                    Selamat Datang
                    <br />
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Kembali!
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600">
                    Login untuk melanjutkan booking lapangan dan belanja produk olahraga favorit Anda.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">Booking lapangan real-time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">Belanja produk berkualitas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">Pembayaran mudah & aman</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 p-6">
                  <p className="text-sm font-medium text-green-900">
                    &ldquo;Platform yang sangat memudahkan untuk booking lapangan. Prosesnya cepat dan simple!&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-green-700">— Ridwan, Member Aktif</p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md border-2 shadow-xl">
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 lg:hidden">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
                    <CardDescription className="mt-2">
                      Masukkan email dan password Anda
                    </CardDescription>
                  </div>
                  <Badge className="mx-auto bg-green-100 text-green-700 hover:bg-green-200" variant="secondary">
                    🔒 Aman & Terpercaya
                  </Badge>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        'Login Sekarang'
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
                        Belum punya akun?{' '}
                        <Link
                          href="/register"
                          className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                        >
                          Daftar Gratis
                        </Link>
                      </p>
                    </div>
                  </form>

                  {/* Demo Accounts */}
                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <p className="mb-2 text-xs font-semibold text-gray-700">Demo Accounts:</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>
                        <span className="font-medium">Admin:</span> admin@padels.com / admin123
                      </p>
                      <p>
                        <span className="font-medium">User:</span> user@padels.com / user123
                      </p>
                    </div>
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
