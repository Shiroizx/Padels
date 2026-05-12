import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditUserForm } from '@/components/admin/edit-user-form'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: PageProps) {
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

  // Get user to edit
  const { data: userToEdit, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !userToEdit) {
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
            <CardTitle>Edit User</CardTitle>
            <p className="text-sm text-gray-600">
              Edit informasi user: {userToEdit.email}
            </p>
          </CardHeader>
          <CardContent>
            <EditUserForm user={userToEdit} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
