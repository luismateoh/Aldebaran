#!/usr/bin/env node

/**
 * Script para inicializar el sistema de administración
 * 
 * Este script:
 * 1. Crea el super administrador inicial
 * 2. Configura los settings por defecto del sistema
 * 3. Verifica que Firebase esté configurado correctamente
 * 
 * Uso: node scripts/init-admin-system.js
 */

const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

// Cargar variables de entorno desde .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=')
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    })
    console.log('✅ Environment variables loaded from .env.local')
  } else {
    console.log('⚠️  .env.local file not found')
  }
}

// Cargar variables de entorno al inicio
loadEnvFile()

// Inicializar Firebase Admin
let app
try {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Firebase Admin SDK credentials not configured')
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  })

  console.log('✅ Firebase Admin SDK initialized')
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message)
  console.error('Make sure these environment variables are set:')
  console.error('- FIREBASE_PROJECT_ID')
  console.error('- FIREBASE_CLIENT_EMAIL')
  console.error('- FIREBASE_PRIVATE_KEY')
  process.exit(1)
}

const db = admin.firestore()

async function initializeSuperAdmin() {
  const superAdminEmail = 'luismateohm@gmail.com'
  const adminRef = db.collection('administrators').doc(superAdminEmail)

  try {
    const adminDoc = await adminRef.get()
    
    if (adminDoc.exists) {
      console.log('✅ Super admin already exists')
      return
    }

    const superAdminData = {
      email: superAdminEmail,
      displayName: 'Luis Mateo',
      photoURL: null,
      role: 'super_admin',
      addedBy: 'system',
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      isActive: true
    }

    await adminRef.set(superAdminData)
    console.log('✅ Super admin created successfully')
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    throw error
  }
}

async function initializeSystemSettings() {
  const settingsRef = db.collection('systemSettings').doc('main')

  try {
    const settingsDoc = await settingsRef.get()
    
    if (settingsDoc.exists) {
      console.log('✅ System settings already exist')
      return
    }

    const defaultSettings = {
      siteName: 'Aldebaran',
      siteDescription: 'Plataforma de eventos de atletismo para Colombia',
      siteUrl: 'https://aldebaran.vercel.app',
      adminEmail: 'luismateohm@gmail.com',
      defaultEventCategory: 'Running',
      autoApproveProposals: false,
      requireEventApproval: true,
      maxEventsPerDay: 10,
      allowPublicEventCreation: true,
      enableRateLimiting: true,
      maxProposalsPerHour: 5,
      aiEnhancementEnabled: true,
      lastUpdatedBy: 'system',
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    await settingsRef.set(defaultSettings)
    console.log('✅ Default system settings created')
  } catch (error) {
    console.error('❌ Error creating system settings:', error)
    throw error
  }
}

async function verifyFirestoreRules() {
  console.log('\n📋 Firestore Rules Verification:')
  console.log('Make sure to deploy the updated firestore.rules file:')
  console.log('   firebase deploy --only firestore:rules')
  console.log('')
  console.log('The rules include:')
  console.log('   ✓ Administrator collection security')
  console.log('   ✓ System settings protection')  
  console.log('   ✓ Multi-admin support')
  console.log('   ✓ Role-based permissions')
}

async function displayConfiguration() {
  console.log('\n🔧 Current Configuration:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  console.log('\n📱 Firebase:')
  console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID || '❌ Not set'}`)
  console.log(`   Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Not set'}`)
  console.log(`   API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not set'}`)
  
  console.log('\n⚙️ System Settings:')
  console.log('   ✅ All settings are now managed in Firestore')
  console.log('   ✅ No dependency on environment variables for app configuration')
  console.log('   ✅ Dynamic configuration through admin panel')
  
  console.log('\n👤 Initial Super Admin:')
  console.log('   Email: luismateohm@gmail.com')
}

async function main() {
  console.log('🚀 Initializing Aldebaran Admin System...\n')

  try {
    await initializeSuperAdmin()
    await initializeSystemSettings()
    await verifyFirestoreRules()
    await displayConfiguration()

    console.log('\n✅ Admin system initialization completed successfully!')
    console.log('\n📝 Next Steps:')
    console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules')
    console.log('2. Test admin login at /admin')
    console.log('3. Configure system settings through the admin panel (/admin/settings)')
    console.log('4. Add additional administrators through /admin/administrators')
    console.log('5. All configuration is now dynamic - no need to restart the app!')

  } catch (error) {
    console.error('\n❌ Initialization failed:', error)
    process.exit(1)
  } finally {
    if (app) {
      await app.delete()
    }
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { initializeSuperAdmin, initializeSystemSettings }