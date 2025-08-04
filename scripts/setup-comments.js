const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, '../events');
const commentsDir = path.join(__dirname, '../data/comments');

// Leer todos los archivos de eventos
const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.md') && file.startsWith('2025'));

console.log(`\n🎉 Encontrados ${eventFiles.length} eventos de 2025\n`);

// Crear comentarios de ejemplo para algunos eventos
const exampleComments = [
  {
    author: "Ana Martínez",
    content: "¡Increíble evento! Ya participé el año pasado y fue una experiencia única. ¿Alguien del grupo de entrenamiento de Medellín?"
  },
  {
    author: "Diego López", 
    content: "Primera vez en esta distancia. ¿Consejos para el día de la carrera? Estoy un poco nervioso pero emocionado."
  },
  {
    author: "Luisa Torres",
    content: "El recorrido es hermoso, especialmente la parte por el parque. ¡No olviden cámara para las fotos!"
  },
  {
    author: "Roberto Silva",
    content: "Para los que preguntan por hidratación: hay puntos cada 2.5K aproximadamente. Yo llevo mi propia botella por si acaso."
  }
];

// Crear comentarios para los primeros 5 eventos como ejemplo
eventFiles.slice(0, 5).forEach((eventFile, index) => {
  const eventId = eventFile.replace('.md', '');
  const commentsFile = path.join(commentsDir, `${eventId}.json`);
  
  if (!fs.existsSync(commentsFile)) {
    // Crear 2-3 comentarios aleatorios
    const numComments = 2 + Math.floor(Math.random() * 2);
    const comments = [];
    
    for (let i = 0; i < numComments; i++) {
      const comment = exampleComments[Math.floor(Math.random() * exampleComments.length)];
      comments.push({
        id: `comment_${Date.now() + i}_${Math.random().toString(36).substr(2, 9)}`,
        author: comment.author,
        content: comment.content,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventId
      });
    }
    
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    console.log(`✅ Comentarios creados para: ${eventId}`);
  } else {
    console.log(`ℹ️  Ya existen comentarios para: ${eventId}`);
  }
});

console.log('\n🚀 ¡Sistema de comentarios listo!');
console.log('\n📝 Para probar:');
console.log('1. Ve a http://localhost:3000');
console.log('2. Haz clic en cualquier evento');
console.log('3. Desplázate hacia abajo para ver los comentarios');
console.log('4. ¡Agrega tu propio comentario!');
console.log('\n💡 Los comentarios se guardan en /data/comments/ (no se suben a git)');
console.log('📖 Lee docs/comments-setup.md para migración a Vercel KV');
