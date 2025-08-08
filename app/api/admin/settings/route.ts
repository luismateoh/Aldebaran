import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-server'
import { adminServiceServer, SystemSettings } from '@/lib/admin-firebase-server'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings from Firestore
    let settings = await adminServiceServer.getSystemSettings()
    
    // If no settings exist, use defaults
    if (!settings) {
      // Ensure initialization
      await adminServiceServer.ensureInitialization()
      settings = await adminServiceServer.getSystemSettings()
    }

    // All settings are now managed through Firestore, no env var overrides

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error getting settings:', error)
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
    const settings = body as Partial<SystemSettings>

    // Validate required fields
    if (settings.siteName && settings.siteName.trim().length === 0) {
      return NextResponse.json({ error: 'Site name cannot be empty' }, { status: 400 })
    }

    if (settings.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminEmail)) {
      return NextResponse.json({ error: 'Invalid admin email format' }, { status: 400 })
    }

    if (settings.maxEventsPerDay && (settings.maxEventsPerDay < 1 || settings.maxEventsPerDay > 50)) {
      return NextResponse.json({ error: 'Max events per day must be between 1 and 50' }, { status: 400 })
    }

    if (settings.maxProposalsPerHour && (settings.maxProposalsPerHour < 1 || settings.maxProposalsPerHour > 20)) {
      return NextResponse.json({ error: 'Max proposals per hour must be between 1 and 20' }, { status: 400 })
    }

    // Get current settings or defaults
    let currentSettings = await adminServiceServer.getSystemSettings()
    if (!currentSettings) {
      // Ensure initialization
      await adminServiceServer.ensureInitialization()
      currentSettings = await adminServiceServer.getSystemSettings()
    }

    // Merge with current settings (only update provided fields)
    const updatedSettings = {
      ...currentSettings,
      ...settings
    }

    // Remove fields that shouldn't be updated via this endpoint
    const { id, lastUpdatedBy, lastUpdatedAt, ...settingsToSave } = updatedSettings

    // Save to Firestore
    await adminServiceServer.updateSystemSettings(settingsToSave, authResult.user.email)
    
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })

  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success || !authResult.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'reset':
        // Reset settings to defaults - ensure initialization will create defaults
        await adminServiceServer.ensureInitialization()
        const defaultSettings = await adminServiceServer.getSystemSettings()
        
        return NextResponse.json({
          success: true,
          settings: defaultSettings,
          message: 'Settings reset to defaults'
        })

      case 'backup':
        // Export current settings
        const currentSettings = await adminServiceServer.getSystemSettings()
        return NextResponse.json({
          success: true,
          backup: {
            timestamp: new Date().toISOString(),
            settings: currentSettings
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in settings action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}