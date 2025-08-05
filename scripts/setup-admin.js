#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuración inicial de Aldebaran Admin Panel\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  try {
    console.log('📝 Configurando variables de entorno...\n');
    
    const adminPassword = await askQuestion('1. Contraseña del panel de administración: ');
    const githubToken = await askQuestion('2. GitHub Personal Access Token (ghp_...): ');
    const githubOwner = await askQuestion('3. Tu usuario de GitHub: ');
    const githubRepo = await askQuestion('4. Nombre del repositorio (Aldebaran): ') || 'Aldebaran';
    const adminEmail = await askQuestion('5. Tu email de administrador: ');
    
    const envContent = `# Autenticación del Panel de Administración
ADMIN_PASSWORD=${adminPassword}

# GitHub API para commits automáticos
GITHUB_TOKEN=${githubToken}
GITHUB_OWNER=${githubOwner}
GITHUB_REPO=${githubRepo}

# Configuración de IA (Groq) - Opcional
GROQ_API_KEY=tu_groq_api_key_aqui

# EmailJS (para formulario público) - Opcional
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=public_key
ADMIN_EMAIL=${adminEmail}`;

    fs.writeFileSync('.env.local', envContent);
    
    console.log('\n✅ Archivo .env.local creado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens');
    console.log('2. Crea un token con permisos de "repo" (para escribir archivos)');
    console.log('3. Reemplaza "tu_groq_api_key_aqui" si quieres usar IA (opcional)');
    console.log('4. Configura EmailJS si quieres recibir propuestas por email (opcional)');
    console.log('\n🚀 Panel de administración listo en:');
    console.log('   • Público: http://localhost:3000/admin (enlace "Proponer Evento")');
    console.log('   • Admin: http://localhost:3000/login (acceso directo)');
    console.log(`   • Contraseña: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
  } finally {
    rl.close();
  }
}

setup();