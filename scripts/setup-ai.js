const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Configuración de API de IA para Aldebaran\n');
console.log('Para usar IA gratuita, necesitas una API key de Groq:');
console.log('1. Ve a https://console.groq.com/keys');
console.log('2. Regístrate gratis (solo email)');
console.log('3. Crea una nueva API key');
console.log('4. Copia la key\n');

rl.question('¿Ya tienes tu API key de Groq? Pégala aquí (o presiona Enter para usar modo básico): ', (apiKey) => {
  const envPath = path.join(__dirname, '../.env.local');
  
  if (apiKey && apiKey.trim()) {
    // Crear archivo .env.local
    const envContent = `# Variables de entorno para Aldebaran
GROQ_API_KEY=${apiKey.trim()}
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ ¡API key configurada correctamente!');
    console.log('✨ Ahora puedes usar IA para generar eventos enriquecidos');
  } else {
    console.log('\n📝 Modo básico activado - se usará generación sin IA');
    console.log('💡 Tip: Puedes agregar la API key más tarde en .env.local');
  }
  
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Ve a http://localhost:3000/admin');
  console.log('2. Completa el formulario de evento');
  console.log('3. Haz clic en "🤖 Enriquecer con IA"');
  console.log('4. Descarga el archivo Markdown');
  console.log('5. Guárdalo en la carpeta /events/\n');
  
  rl.close();
});
