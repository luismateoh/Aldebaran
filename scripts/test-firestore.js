#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firestore
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

async function testFirestore() {
  console.log('🧪 Testing Firestore Configuration...\n')

  try {
    // Inicializar Firebase Admin
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }

    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error('Firebase Admin SDK credentials not configured')
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    })

    const db = admin.firestore()
    console.log('✅ Firebase Admin SDK connected')

    // Test 1: Verificar colecciones
    console.log('\n📊 Checking collections...')
    
    const adminsSnapshot = await db.collection('administrators').get()
    console.log(`✅ Administrators: ${adminsSnapshot.size} documents`)
    
    const settingsSnapshot = await db.collection('systemSettings').get()
    console.log(`✅ System Settings: ${settingsSnapshot.size} documents`)

    // Test 2: Verificar super admin
    console.log('\n👤 Checking super admin...')
    const superAdminDoc = await db.collection('administrators').doc('luismateohm@gmail.com').get()
    
    if (superAdminDoc.exists) {
      const data = superAdminDoc.data()
      console.log(`✅ Super admin exists: ${data.email} (${data.role})`)
    } else {
      console.log('❌ Super admin not found')
    }

    // Test 3: Verificar settings
    console.log('\n⚙️ Checking system settings...')
    const settingsDoc = await db.collection('systemSettings').doc('main').get()
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data()
      console.log(`✅ System settings exist: ${data.siteName}`)
      console.log(`   Site URL: ${data.siteUrl}`)
      console.log(`   AI Enabled: ${data.aiEnhancementEnabled}`)
    } else {
      console.log('❌ System settings not found')
    }

    console.log('\n✅ Firestore test completed successfully!')
    
    await app.delete()

  } catch (error) {
    console.error('\n❌ Firestore test failed:', error.message)
    process.exit(1)
  }
}

testFirestore()