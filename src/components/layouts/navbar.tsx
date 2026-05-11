'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LogOut, ShoppingCart, User } from 'lucide-react'
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
  const itemCount = useCartStore((state) => state.getItemCount())

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout berhasil')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Logout gagal')
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
          <h1 className="text-2xl font-bold text-green-600">Padels</h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link href="/courts">
                    <Button variant="ghost">Lapangan</Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="ghost">Produk</Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                          {itemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                {user.role === 'admin' && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Admin
                  </span>
                )}
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
