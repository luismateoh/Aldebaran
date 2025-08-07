require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });
}

const db = admin.firestore();

async function analyzeEvents() {
  console.log('🔍 Analizando eventos en Firestore...\n');
  
  try {
    const eventsCollection = db.collection('events');
    const snapshot = await eventsCollection.get();
    
    const events = [];
    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`📊 Total de eventos: ${events.length}\n`);

    // Analizar eventos sin título
    const eventsWithoutTitle = events.filter(event => !event.title || event.title.trim() === '');
    console.log(`❌ Eventos sin título: ${eventsWithoutTitle.length}`);
    eventsWithoutTitle.forEach(event => {
      console.log(`   - ID: ${event.id}`);
    });

    // Analizar duplicados por título
    const titleGroups = {};
    events.forEach(event => {
      if (event.title && event.title.trim()) {
        const normalizedTitle = event.title.toLowerCase().trim();
        if (!titleGroups[normalizedTitle]) {
          titleGroups[normalizedTitle] = [];
        }
        titleGroups[normalizedTitle].push(event);
      }
    });

    const duplicates = Object.entries(titleGroups)
      .filter(([title, eventGroup]) => eventGroup.length > 1)
      .map(([title, eventGroup]) => ({ title, events: eventGroup }));

    console.log(`\n🔄 Grupos de eventos duplicados: ${duplicates.length}`);
    duplicates.forEach(group => {
      console.log(`   - "${group.title}": ${group.events.length} eventos`);
      group.events.forEach(event => {
        console.log(`     * ID: ${event.id}, Fecha: ${event.eventDate}`);
      });
    });

    // Analizar eventos pasados vs futuros
    const today = new Date();
    const futureEvents = events.filter(event => {
      if (!event.eventDate) return false;
      const eventDate = new Date(event.eventDate);
      return eventDate >= today;
    });
    
    const pastEvents = events.filter(event => {
      if (!event.eventDate) return true; // Sin fecha los consideramos pasados
      const eventDate = new Date(event.eventDate);
      return eventDate < today;
    });

    console.log(`\n📅 Eventos futuros: ${futureEvents.length}`);
    console.log(`📅 Eventos pasados: ${pastEvents.length}`);
    
    return {
      total: events.length,
      withoutTitle: eventsWithoutTitle,
      duplicates,
      future: futureEvents.length,
      past: pastEvents.length
    };

  } catch (error) {
    console.error('❌ Error analizando eventos:', error);
    throw error;
  }
}

async function cleanupEvents() {
  console.log('🧹 Iniciando limpieza de eventos...\n');
  
  const analysis = await analyzeEvents();
  
  // Limpiar eventos sin título
  if (analysis.withoutTitle.length > 0) {
    console.log(`\n🗑️  Eliminando ${analysis.withoutTitle.length} eventos sin título...`);
    
    const batch = db.batch();
    analysis.withoutTitle.forEach(event => {
      const docRef = db.collection('events').doc(event.id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    console.log('✅ Eventos sin título eliminados');
  }
  
  // Limpiar duplicados (mantener el más reciente de cada grupo)
  if (analysis.duplicates.length > 0) {
    console.log(`\n🔄 Limpiando duplicados...`);
    
    for (const group of analysis.duplicates) {
      // Ordenar por fecha de creación/modificación y mantener el más reciente
      const sortedEvents = group.events.sort((a, b) => {
        const dateA = new Date(a.publishDate || a.eventDate || 0);
        const dateB = new Date(b.publishDate || b.eventDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      const keepEvent = sortedEvents[0];
      const deleteEvents = sortedEvents.slice(1);
      
      console.log(`   - Manteniendo: ${keepEvent.id} (${keepEvent.title})`);
      console.log(`   - Eliminando: ${deleteEvents.map(e => e.id).join(', ')}`);
      
      const batch = db.batch();
      deleteEvents.forEach(event => {
        const docRef = db.collection('events').doc(event.id);
        batch.delete(docRef);
      });
      
      await batch.commit();
    }
    
    console.log('✅ Duplicados eliminados');
  }
  
  console.log('\n🎉 Limpieza completada!');
  
  // Análisis final
  console.log('\n📊 Análisis final:');
  await analyzeEvents();
}

// Ejecutar según el argumento
const action = process.argv[2];

if (action === 'analyze') {
  analyzeEvents()
    .then(() => {
      console.log('\n✅ Análisis completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} else if (action === 'cleanup') {
  cleanupEvents()
    .then(() => {
      console.log('\n✅ Limpieza completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} else {
  console.log('Uso:');
  console.log('  node scripts/cleanup-events.js analyze  - Analizar eventos');
  console.log('  node scripts/cleanup-events.js cleanup  - Limpiar duplicados y eventos sin título');
  process.exit(1);
}