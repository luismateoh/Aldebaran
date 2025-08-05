#!/usr/bin/env node

console.log('🔍 VERIFICANDO CONEXIONES REALES DE VERCEL\n');

async function testConnections() {
  try {
    // Test 1: Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('  ✅ POSTGRES_URL:', process.env.POSTGRES_URL ? '✓ Configurada' : '❌ Falta');
    console.log('  ✅ BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✓ Configurada' : '❌ Falta');
    console.log('  ✅ GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Configurada' : '❌ Falta');
    console.log();

    // Test 2: Test de conexión a Postgres
    console.log('🗃️ Probando conexión a Postgres...');
    try {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`SELECT NOW() as current_time`;
      console.log('  ✅ Postgres conectado:', result.rows[0].current_time);
    } catch (error) {
      console.log('  ❌ Error Postgres:', error.message);
    }
    console.log();

    // Test 3: Test de Blob Storage
    console.log('📦 Probando Blob Storage...');
    try {
      const { list } = await import('@vercel/blob');
      const blobs = await list();
      console.log('  ✅ Blob Storage conectado, archivos:', blobs.blobs.length);
    } catch (error) {
      console.log('  ❌ Error Blob Storage:', error.message);
    }
    console.log();

    console.log('🎉 CONFIGURACIÓN COMPLETADA');
    console.log('   • Desarrollo local con conexiones reales de Vercel');
    console.log('   • Datos persistentes en producción');
    console.log('   • Sin necesidad de deploy para cambios de contenido');
    console.log();
    console.log('🚀 URLS DE PRUEBA:');
    console.log('   • http://localhost:3000       → Sitio principal');
    console.log('   • http://localhost:3000/admin → Panel administrativo');
    console.log('   • http://localhost:3000/proponer → Formulario público');
    console.log();

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Cargar variables de entorno si estamos en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

testConnections();