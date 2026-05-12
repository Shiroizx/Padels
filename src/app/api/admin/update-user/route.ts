import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { userId, name, email, role } = body

    console.log('Update user request:', { userId, name, email, role })

    if (!userId || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role key for database update to bypass RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured',
          message: 'Cannot update user without service role key'
        },
        { status: 500 }
      )
    }

    // Create admin client with service role
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Update user in database using admin client
    const { data: updateData, error: dbError } = await adminClient
      .from('users')
      .update({
        name,
        role,
      })
      .eq('id', userId)
      .select()

    if (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    console.log('User updated successfully:', updateData)

    // If email changed, update in auth
    let emailUpdated = false
    if (email) {
      try {
        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
          email,
        })

        if (authError) {
          console.error('Auth email update error:', authError)
        } else {
          emailUpdated = true
          console.log('Email updated successfully')
        }
      } catch (error) {
        console.error('Email update error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      emailUpdated,
    })
  } catch (error) {
    console.error('Update user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
