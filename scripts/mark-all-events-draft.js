const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = getFirestore();

async function markAllEventsAsDraft() {
  try {
    console.log('🔄 Iniciando proceso para marcar todos los eventos como draft...');
    
    // Obtener todos los eventos
    const eventsSnapshot = await db.collection('events').get();
    console.log(`📊 Encontrados ${eventsSnapshot.docs.length} eventos`);
    
    if (eventsSnapshot.docs.length === 0) {
      console.log('ℹ️  No hay eventos para actualizar');
      return;
    }
    
    // Preparar batch update
    const batch = db.batch();
    let updateCount = 0;
    
    eventsSnapshot.docs.forEach(doc => {
      const eventData = doc.data();
      
      // Solo actualizar si no es draft o no tiene el campo draft
      if (!eventData.draft) {
        batch.update(doc.ref, { 
          draft: true,
          updatedAt: new Date()
        });
        updateCount++;
        console.log(`📝 Marcando como draft: ${eventData.title || doc.id}`);
      } else {
        console.log(`⏭️  Ya es draft: ${eventData.title || doc.id}`);
      }
    });
    
    if (updateCount > 0) {
      // Ejecutar batch update
      await batch.commit();
      console.log(`✅ Actualizados ${updateCount} eventos como draft`);
    } else {
      console.log('ℹ️  Todos los eventos ya estaban marcados como draft');
    }
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error marcando eventos como draft:', error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  markAllEventsAsDraft()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { markAllEventsAsDraft };