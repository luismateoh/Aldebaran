#!/usr/bin/env node

/**
 * Limpia textos de eventos en Firestore:
 * - Corrige mojibake/tildes dañadas
 * - Elimina descripciones automáticas de bajo valor
 *
 * Uso:
 *   node scripts/cleanup-events-texts.js
 */

const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file not found')
    return
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) return

    const [key, ...valueParts] = trimmedLine.split('=')
    if (!key || valueParts.length === 0) return

    let value = valueParts.join('=')
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  })

  console.log('✅ Environment variables loaded from .env.local')
}

function normalizeText(value) {
  if (typeof value !== 'string') return ''

  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/ÃÁ/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Â/g, '')
    .replace(/â€™/g, '’')
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/MARAT\s*[\uFFFD\?]\s*N/gi, 'MARATÓN')
    .replace(/Marat\s*[\uFFFD\?]\s*n/g, 'Maratón')
    .replace(/autom[\uFFFD\?]ticamente/gi, 'automáticamente')
    .replace(/difusi[\uFFFD\?]n/gi, 'difusión')
    .replace(/informaci[\uFFFD\?]n/gi, 'información')
    .replace(/ubicaci[\uFFFD\?]n/gi, 'ubicación')
    .replace(/organizador[\uFFFD\?]es/gi, 'organizadores')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLowValueDescription(value) {
  const normalized = normalizeText(value).toLowerCase()
  return (
    normalized.includes('evento cargado') &&
    normalized.includes('fuente visual proporcionada') &&
    normalized.includes('verificar detalles oficiales')
  )
}

async function main() {
  loadEnvFile()

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
  const snapshot = await db.collection('events').get()

  console.log(`📊 Eventos encontrados: ${snapshot.size}`)

  let changedDocs = 0
  let clearedDescriptions = 0
  let fixedMojibake = 0

  let batch = db.batch()
  let batchOps = 0

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const updates = {}

    const title = normalizeText(data.title)
    if ((data.title || '') !== title) {
      updates.title = title
      fixedMojibake++
    }

    const municipality = normalizeText(data.municipality)
    if ((data.municipality || '') !== municipality) {
      updates.municipality = municipality
      fixedMojibake++
    }

    const department = normalizeText(data.department)
    if ((data.department || '') !== department) {
      updates.department = department
      fixedMojibake++
    }

    const descriptionNormalized = normalizeText(data.description)
    const contentHtmlNormalized = normalizeText(data.contentHtml)
    const snippetNormalized = normalizeText(data.snippet)

    const cleanedDescription = isLowValueDescription(descriptionNormalized) ? '' : descriptionNormalized
    const cleanedContentHtml = isLowValueDescription(contentHtmlNormalized) ? '' : contentHtmlNormalized
    const cleanedSnippet = isLowValueDescription(snippetNormalized) ? '' : snippetNormalized

    if ((data.description || '') !== cleanedDescription) {
      updates.description = cleanedDescription
      if (cleanedDescription === '') clearedDescriptions++
      else fixedMojibake++
    }

    if ((data.contentHtml || '') !== cleanedContentHtml) {
      updates.contentHtml = cleanedContentHtml
      if (cleanedContentHtml === '') clearedDescriptions++
      else fixedMojibake++
    }

    if ((data.snippet || '') !== cleanedSnippet) {
      updates.snippet = cleanedSnippet
      if (cleanedSnippet === '') clearedDescriptions++
      else fixedMojibake++
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp()
      batch.update(doc.ref, updates)
      batchOps++
      changedDocs++
    }

    if (batchOps >= 400) {
      await batch.commit()
      batch = db.batch()
      batchOps = 0
    }
  }

  if (batchOps > 0) {
    await batch.commit()
  }

  console.log('✅ Limpieza completada')
  console.log(`🧾 Documentos actualizados: ${changedDocs}`)
  console.log(`🧹 Campos con texto de bajo valor limpiados: ${clearedDescriptions}`)
  console.log(`🔤 Correcciones de texto/tildes aplicadas: ${fixedMojibake}`)

  await app.delete()
}

main().catch((error) => {
  console.error('❌ Error en limpieza de eventos:', error)
  process.exit(1)
})
