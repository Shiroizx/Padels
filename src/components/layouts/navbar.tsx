'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LogOut, ShoppingCart, User, Menu, X, Home, Calendar, Package } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

interface NavbarProps {
  user?: {
    name: string
    email: string
    role: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [itemCount, setItemCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Only access cart store on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    const count = useCartStore.getState().getItemCount()
    setItemCount(count)

    // Subscribe to cart changes
    const unsubscribe = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout berhasil')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout gagal')
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-green-600">Padels</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {user ? (
              <>
                {user.role === 'user' && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-sm">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/courts">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Lapangan
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Produk
                      </Button>
                    </Link>
                    <Link href="/bookings">
                      <Button variant="ghost" size="sm" className="text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Booking
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="text-sm">
                        <Package className="mr-2 h-4 w-4" />
                        Order
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button variant="ghost" size="sm" className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {isMounted && itemCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                            {itemCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </>
                )}
                
                <div className="hidden lg:flex items-center gap-2 text-sm border-l pl-4 ml-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Admin
                    </span>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex md:hidden items-center gap-2">
            {user?.role === 'user' && (
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {isMounted && itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Admin
                    </span>
                  )}
                </div>

                {user.role === 'user' && (
                  <>
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Home className="mr-3 h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/courts" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="mr-3 h-5 w-5" />
                        Lapangan
                      </Button>
                    </Link>
                    <Link href="/products" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Package className="mr-3 h-5 w-5" />
                        Produk
                      </Button>
                    </Link>
                    <Link href="/bookings" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="mr-3 h-5 w-5" />
                        Booking Saya
                      </Button>
                    </Link>
                    <Link href="/orders" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Package className="mr-3 h-5 w-5" />
                        Order Saya
                      </Button>
                    </Link>
                  </>
                )}
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                    size="sm"
                    onClick={() => {
                      closeMobileMenu()
                      handleLogout()
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <Button className="w-full" size="sm">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
