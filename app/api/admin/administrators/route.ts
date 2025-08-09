import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-server'
import { adminServiceServer, Administrator } from '@/lib/admin-firebase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/admin/administrators - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)

    // Get administrators from Firestore
    const administrators = await adminServiceServer.getAdministrators()

    return NextResponse.json({
      success: true,
      administrators
    })
  } catch (error) {
    console.error('Error getting administrators:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success || !authResult.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'admin' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    try {
      // Add administrator to Firestore
      const adminId = await adminServiceServer.addAdministrator({
        email,
        displayName: null, // Will be updated when user logs in
        photoURL: null,
        role: role as 'admin' | 'super_admin',
        addedBy: authResult.user.email
      }, authResult.user.email)

      return NextResponse.json({
        success: true,
        message: 'Administrator added successfully',
        adminId
      })

    } catch (error: any) {
      if (error.message === 'Administrator already exists') {
        return NextResponse.json({ error: 'User is already an administrator' }, { status: 409 })
      }
      throw error
    }

  } catch (error) {
    console.error('Error adding administrator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
      // Remove administrator from Firestore
      await adminServiceServer.removeAdministrator(email)

      return NextResponse.json({
        success: true,
        message: 'Administrator removed successfully'
      })

    } catch (error: any) {
      if (error.message === 'Cannot remove super administrator') {
        return NextResponse.json({ error: 'Cannot remove super administrator' }, { status: 403 })
      }
      if (error.message === 'Administrator not found') {
        return NextResponse.json({ error: 'Administrator not found' }, { status: 404 })
      }
      throw error
    }

  } catch (error) {
    console.error('Error removing administrator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}