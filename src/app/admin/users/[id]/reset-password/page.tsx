import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { ResetPasswordForm } from '@/components/admin/reset-password-form'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!adminUser || adminUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get user to reset password
  const { data: userToReset, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !userToReset) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={adminUser} />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar User
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password User</CardTitle>
            <p className="text-sm text-gray-600">
              Reset password untuk: {userToReset.email}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-orange-50 p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900">Perhatian</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Anda akan mengubah password user ini. Pastikan untuk memberitahu user tentang password baru mereka.
                  </p>
                </div>
              </div>
            </div>

            <ResetPasswordForm user={userToReset} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
