'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ShoppingBag, Trophy, Clock, MapPin, Star, CheckCircle, ArrowRight, Zap, Shield, Users } from 'lucide-react'
import { AnimatedSection, StaggerContainer, StaggerItem, FloatingElement, ScaleOnHover } from '@/components/shared/animated-section'

export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Padels</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="container relative mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <AnimatedSection animation="slideDown" delay={0.1}>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200" variant="secondary">
                🎾 Platform Booking Lapangan Terbaik
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeIn" delay={0.2}>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Booking Lapangan Padel
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {' '}Jadi Mudah
                </span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="slideUp" delay={0.3}>
              <p className="mb-8 text-lg text-gray-600 sm:text-xl">
                Platform all-in-one untuk booking lapangan padel/tenis dan belanja produk olahraga berkualitas. 
                Cepat, mudah, dan terpercaya.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="scale" delay={0.4}>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 sm:w-auto">
                    Mulai Booking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/courts">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Lihat Lapangan
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
            
            {/* Stats */}
            <StaggerContainer className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              <StaggerItem>
                <div className="text-2xl font-bold text-green-600 sm:text-3xl">100+</div>
                <div className="text-xs text-gray-600 sm:text-sm">Booking Selesai</div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-2xl font-bold text-green-600 sm:text-3xl">50+</div>
                <div className="text-xs text-gray-600 sm:text-sm">Member Aktif</div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-2xl font-bold text-green-600 sm:text-3xl">4.9</div>
                <div className="text-xs text-gray-600 sm:text-sm">Rating Pengguna</div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="mb-12 text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700" variant="secondary">
              Fitur Unggulan
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Kenapa Pilih Padels?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Kami menyediakan platform terlengkap untuk kebutuhan olahraga Anda
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-green-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3 group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">Booking Real-Time</CardTitle>
                    <CardDescription>
                      Lihat ketersediaan lapangan secara real-time dan booking langsung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Cek jadwal tersedia
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Pilih waktu fleksibel
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Konfirmasi instan
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>

            {/* Feature 2 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-blue-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                        <ShoppingBag className="h-8 w-8 text-blue-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">E-Commerce Terintegrasi</CardTitle>
                    <CardDescription>
                      Belanja produk olahraga berkualitas dalam satu platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Raket & aksesoris
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Harga kompetitif
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Produk original
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>

            {/* Feature 3 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-purple-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-3 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                        <Zap className="h-8 w-8 text-purple-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">Pembayaran Mudah</CardTitle>
                    <CardDescription>
                      Berbagai metode pembayaran untuk kemudahan Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        Transfer bank
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        E-wallet & QRIS
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        Bayar di tempat
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>

            {/* Feature 4 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-orange-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-orange-100 to-red-100 p-3 group-hover:from-orange-200 group-hover:to-red-200 transition-colors">
                        <Trophy className="h-8 w-8 text-orange-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">Fasilitas Premium</CardTitle>
                    <CardDescription>
                      Lapangan dengan fasilitas terbaik untuk kenyamanan Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        Indoor & outdoor
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        AC & shower
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        Loker & parkir
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>

            {/* Feature 5 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-teal-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 p-3 group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors">
                        <Shield className="h-8 w-8 text-teal-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">Aman & Terpercaya</CardTitle>
                    <CardDescription>
                      Data Anda aman dengan sistem keamanan terbaik
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-600" />
                        Enkripsi data
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-600" />
                        Transaksi aman
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-600" />
                        Privacy terjaga
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>

            {/* Feature 6 */}
            <StaggerItem>
              <ScaleOnHover>
                <Card className="group h-full border-2 transition-all hover:border-rose-500 hover:shadow-xl">
                  <CardHeader>
                    <FloatingElement>
                      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 group-hover:from-rose-200 group-hover:to-pink-200 transition-colors">
                        <Users className="h-8 w-8 text-rose-600" />
                      </div>
                    </FloatingElement>
                    <CardTitle className="text-xl">Customer Support 24/7</CardTitle>
                    <CardDescription>
                      Tim support siap membantu Anda kapan saja
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-rose-600" />
                        Respon cepat
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-rose-600" />
                        Chat & email
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-rose-600" />
                        Solusi tepat
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="slideUp" className="mb-12 text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-700" variant="secondary">
              Cara Kerja
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Booking Dalam 3 Langkah Mudah
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Proses booking yang simpel dan cepat
            </p>
          </AnimatedSection>

          <StaggerContainer className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <StaggerItem>
              <div className="text-center">
                <AnimatedSection animation="scale">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl font-bold text-white">
                    1
                  </div>
                </AnimatedSection>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Pilih Lapangan</h3>
                <p className="text-gray-600">
                  Browse lapangan yang tersedia dan lihat jadwal real-time
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <AnimatedSection animation="scale" delay={0.1}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
                    2
                  </div>
                </AnimatedSection>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Pilih Waktu</h3>
                <p className="text-gray-600">
                  Tentukan tanggal dan jam yang sesuai dengan jadwal Anda
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <AnimatedSection animation="scale" delay={0.2}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-2xl font-bold text-white">
                    3
                  </div>
                </AnimatedSection>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Bayar & Main</h3>
                <p className="text-gray-600">
                  Lakukan pembayaran dan siap bermain di lapangan
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scale">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl">
              <CardContent className="p-8 sm:p-12 lg:p-16">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    Siap Mulai Bermain?
                  </h2>
                  <p className="mb-8 text-lg text-green-50 sm:text-xl">
                    Daftar sekarang dan dapatkan pengalaman booking lapangan yang mudah dan menyenangkan
                  </p>
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/register">
                      <Button size="lg" variant="secondary" className="w-full bg-white text-green-600 hover:bg-gray-100 sm:w-auto">
                        Daftar Gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10 sm:w-auto">
                        Sudah Punya Akun
                      </Button>
                    </Link>
                  </div>
                  <p className="mt-6 text-sm text-green-100">
                    ✓ Gratis selamanya · ✓ Tanpa biaya tersembunyi · ✓ Batal kapan saja
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Padels</span>
              </div>
              <p className="mb-4 text-gray-600">
                Platform booking lapangan padel/tenis dan e-commerce produk olahraga terpercaya di Indonesia.
              </p>
              <div className="flex gap-4">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Layanan</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/courts" className="hover:text-green-600">
                    Booking Lapangan
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-green-600">
                    Belanja Produk
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-green-600">
                    Riwayat Booking
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Kontak</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Jakarta, Indonesia
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  09:00 - 22:00
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-gray-600">
            <p>&copy; 2026 Padels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
