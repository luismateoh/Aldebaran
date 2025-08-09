// Script para marcar todos los eventos como draft usando API
const fetch = require('node:fetch');

async function markAllEventsAsDraft() {
  try {
    console.log('🔄 Marcando todos los eventos como draft...');
    
    // Esto requiere que tengas acceso admin y el servidor esté corriendo
    // Vamos a usar una aproximación diferente con un endpoint directo
    
    console.log('ℹ️  Para marcar todos los eventos como draft, necesitas:');
    console.log('1. Tener acceso admin');
    console.log('2. Ir a /admin/events');
    console.log('3. Usar la función batch update que crearemos');
    
    console.log('\n📝 Creando endpoint para batch update...');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

markAllEventsAsDraft();