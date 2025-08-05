#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ALDEBARAN - Configuración Simplificada\n');
console.log('Sistema Híbrido: Postgres + Blob Storage\n');

// Verificar que estamos en el proyecto correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Ejecuta este script desde la raíz del proyecto Aldebaran');
  process.exit(1);
}

console.log('📋 PASOS PARA CONFIGURAR EN VERCEL:\n');

console.log('🔧 1. CREAR BASES DE DATOS EN VERCEL DASHBOARD:');
console.log('   👉 Ve a: https://vercel.com/dashboard/[tu-proyecto]/storage\n');

console.log('   🗃️ POSTGRES:');
console.log('   • "Create Database" → "Postgres (Neon)"');
console.log('   • Nombre: "aldebaran-postgres"');
console.log('   • Plan: Hobby (gratis)\n');

console.log('   📦 BLOB STORAGE:');
console.log('   • "Create Database" → "Blob"');
console.log('   • Nombre: "aldebaran-blob"\n');

console.log('   ✅ Vercel configurará automáticamente todas las variables de entorno\n');

console.log('🔧 2. VARIABLES MANUALES (Settings → Environment Variables):');
console.log('   • ADMIN_PASSWORD = Lafuente12');
console.log('   • GITHUB_TOKEN = tu_github_token');
console.log('   • GITHUB_OWNER = luismateoh');
console.log('   • GITHUB_REPO = Aldebaran');
console.log('   • ADMIN_EMAIL = luismateohm@gmail.com\n');

console.log('🚀 3. DESPLEGAR:');
console.log('   • git add . && git commit -m "Sistema híbrido configurado"');
console.log('   • git push origin main');
console.log('   • Vercel desplegará automáticamente\n');

console.log('✅ SISTEMA LIMPIO - SOLO LO ESENCIAL:\n');

console.log('📊 QUÉ SE ELIMINÓ:');
console.log('   ❌ Dependencias innecesarias - Limpiadas');
console.log('   ❌ Archivos de migración obsoletos - Removidos\n');

console.log('🎯 QUÉ SE MANTIENE:');
console.log('   ✅ Postgres → Comentarios, propuestas, eventos');
console.log('   ✅ Blob Storage → Archivos markdown e imágenes');
console.log('   ✅ Sistema actual → Fallback completo');
console.log('   ✅ GitHub → Respaldo y deploy tradicional\n');

console.log('🔄 FLUJO SIMPLIFICADO:');
console.log('   1. Usuario público → /proponer → Postgres');
console.log('   2. Admin → /admin → Crea evento → Postgres + Blob');
console.log('   3. Evento visible inmediatamente (sin deploy)');
console.log('   4. Comentarios persistentes en Postgres\n');

console.log('🛠️ COMANDOS DE DESARROLLO:');
console.log('   • npm run dev        → Servidor desarrollo');
console.log('   • npm run setup      → Este script');
console.log('   • npm run db:studio  → Explorar base de datos\n');

console.log('📱 URLS DE PRUEBA:');
console.log('   • /admin    → Panel administrativo');
console.log('   • /proponer → Formulario público');
console.log('   • /events   → Lista de eventos\n');

console.log('⚡ VENTAJAS DEL SISTEMA LIMPIO:');
console.log('   🚀 Sin deploys para añadir carreras');
console.log('   💾 Comentarios permanentes');
console.log('   📊 Propuestas organizadas');
console.log('   🔍 Búsquedas SQL rápidas');
console.log('   📦 Archivos en la nube');
console.log('   🔄 Sincronización automática\n');

console.log('🎉 ¡CONFIGURACIÓN COMPLETA!');
console.log('   Sigue los pasos 1-3 y tendrás el sistema funcionando.\n');

console.log('\n🏁 ¡Listo para producción!');