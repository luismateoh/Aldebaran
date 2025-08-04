const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n📧 Configuración de EmailJS para Aldebaran\n');
console.log('EmailJS es un servicio GRATUITO para enviar emails desde el frontend.');
console.log('Perfecto para formularios de contacto sin backend.\n');

console.log('🚀 Pasos para configurar EmailJS:');
console.log('1. Ve a https://www.emailjs.com/');
console.log('2. Crea una cuenta gratuita');
console.log('3. Crea un nuevo servicio (Gmail, Outlook, etc.)');
console.log('4. Crea un template de email');
console.log('5. Obtén tus IDs\n');

console.log('📋 Necesitarás estos datos:');
console.log('• Service ID');
console.log('• Template ID'); 
console.log('• Public Key\n');

rl.question('¿Ya tienes configurado EmailJS? (y/n): ', (hasEmailJS) => {
  if (hasEmailJS.toLowerCase() === 'y') {
    // Recopilar datos
    rl.question('Service ID: ', (serviceId) => {
      rl.question('Template ID: ', (templateId) => {
        rl.question('Public Key: ', (publicKey) => {
          rl.question('Tu email para recibir eventos: ', (adminEmail) => {
            
            // Crear archivo .env.local
            const envPath = path.join(__dirname, '../.env.local');
            let envContent = '';
            
            // Leer contenido existente si existe
            if (fs.existsSync(envPath)) {
              envContent = fs.readFileSync(envPath, 'utf8');
              // Remover configuraciones EmailJS existentes
              envContent = envContent.replace(/NEXT_PUBLIC_EMAILJS_.*/g, '');
              envContent = envContent.replace(/ADMIN_EMAIL=.*/g, '');
            }
            
            // Agregar nuevas configuraciones
            envContent += `

# EmailJS Configuration (para formulario en producción)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=${serviceId}
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=${templateId}
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=${publicKey}
ADMIN_EMAIL=${adminEmail}
`;
            
            fs.writeFileSync(envPath, envContent);
            
            console.log('\n✅ ¡EmailJS configurado correctamente!');
            console.log('✨ Ahora el formulario en producción enviará emails a:', adminEmail);
            console.log('\n🎯 Template sugerido para EmailJS:');
            console.log('---');
            console.log('Subject: 🏃‍♂️ Nuevo Evento - {{event_title}}');
            console.log('');
            console.log('Body:');
            console.log('🏃‍♂️ NUEVO EVENTO PROPUESTO');
            console.log('');
            console.log('📝 INFORMACIÓN:');
            console.log('• Título: {{event_title}}');
            console.log('• Fecha: {{event_date}}');
            console.log('• Ciudad: {{municipality}}, {{department}}');
            console.log('• Organizador: {{organizer}}');
            console.log('• Categoría: {{category}}');
            console.log('• Costo: {{registration_fee}}');
            console.log('• Web: {{website}}');
            console.log('• Distancias: {{distances}}');
            console.log('');
            console.log('📋 DESCRIPCIÓN:');
            console.log('{{description}}');
            console.log('');
            console.log('⏰ Enviado: {{submitted_at}}');
            console.log('---');
            console.log('\n💡 Copia este template en EmailJS para que funcione correctamente.');
            
            rl.close();
          });
        });
      });
    });
  } else {
    console.log('\n📖 Guía rápida de configuración:');
    console.log('');
    console.log('1. 🌐 Ve a https://www.emailjs.com/');
    console.log('2. 📧 Regístrate con tu email');
    console.log('3. ⚙️  Crea un servicio (conecta tu Gmail/Outlook)');
    console.log('4. 📝 Crea un template con las variables mostradas arriba');
    console.log('5. 🔑 Obtén tus keys y ejecuta este script de nuevo');
    console.log('');
    console.log('🆓 Es completamente GRATUITO hasta 200 emails/mes');
    console.log('💡 Perfecto para formularios de eventos');
    
    rl.close();
  }
});
