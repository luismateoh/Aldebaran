const fs = require('fs');
const path = require('path');

// Mapeo de eventos que típicamente se repiten anualmente
const RECURRING_EVENTS = {
  'carreradelasrosas': { month: 'oct', day: 20 },
  'mediamaratondebogota': { month: 'jul', day: 28 },
  'maratonmedellin': { month: 'sep', day: 1 },
  'carreradelamujer': { month: 'sep', day: 8 },
  'mediamaratondecali': { month: 'may', day: 26 },
  'corremitierra': { month: 'nov', day: 17 },
  'christmasrun': { month: 'dec', day: 15 },
  'sansilvestredecartagena': { month: 'dec', day: 28 },
  'allianz15k': { month: 'jul', day: 7 },
  'mediamaratondemonteria': { month: 'nov', day: 10 },
  'mediamaratondemanizales': { month: 'dec', day: 1 },
  'mediamaratondecucuta': { month: 'nov', day: 24 }
};

function updateEventDates() {
  const eventsDir = path.join(__dirname, '../events');
  const files = fs.readdirSync(eventsDir);
  
  const year2024Files = files.filter(file => file.startsWith('2024-'));
  
  year2024Files.forEach(file => {
    const filePath = path.join(eventsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer el nombre del evento del filename
    const eventName = file.split('_').slice(2).join('_').replace('.md', '');
    
    // Verificar si es un evento recurrente
    const recurringEvent = Object.keys(RECURRING_EVENTS).find(key => 
      eventName.toLowerCase().includes(key)
    );
    
    if (recurringEvent) {
      const eventInfo = RECURRING_EVENTS[recurringEvent];
      const newFileName = `2025-${eventInfo.month}-${eventInfo.day}_${file.split('_').slice(1).join('_')}`;
      const newFilePath = path.join(eventsDir, newFileName);
      
      // Actualizar el contenido
      let newContent = content.replace(/eventDate: 2024-[a-z]+-\d+/i, 
        `eventDate: 2025-${eventInfo.month}-${eventInfo.day}`);
      
      newContent = newContent.replace(/registrationDeadline: 2024-[a-z]+-\d+/i, 
        `registrationDeadline: 2025-${eventInfo.month}-${eventInfo.day}`);
      
      // Crear el nuevo archivo
      fs.writeFileSync(newFilePath, newContent);
      console.log(`✅ Actualizado: ${file} → ${newFileName}`);
    } else {
      console.log(`⚠️  Evento no recurrente detectado: ${file}`);
    }
  });
  
  console.log('\n🎉 Actualización de eventos completada!');
}

// Función para generar eventos futuros basados en patrones
function generateFutureEvents() {
  const eventsDir = path.join(__dirname, '../events');
  const templatePath = path.join(eventsDir, '2024-1-1__template.md');
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // Eventos populares que sabemos que se repiten
  const futureEvents = [
    {
      title: 'MEDIA MARATÓN DE BOGOTÁ',
      month: 'jul',
      day: 28,
      city: 'bogota',
      name: 'mediamaratondebogota',
      organizer: 'IDRD',
      distances: ['5k', '10k', '21k'],
      department: 'Bogotá',
      municipality: 'Bogotá'
    },
    {
      title: 'CARRERA DE LAS ROSAS',
      month: 'oct',
      day: 20,
      city: 'barranquilla',
      name: 'carreradelasrosas',
      organizer: 'JAO',
      distances: ['2k', '5k', '10k', '15k'],
      department: 'Atlántico',
      municipality: 'Barranquilla'
    },
    {
      title: 'MARATÓN DE MEDELLÍN',
      month: 'sep',
      day: 1,
      city: 'medellin',
      name: 'maratonmedellin',
      organizer: 'Alcaldía de Medellín',
      distances: ['5k', '10k', '21k', '42k'],
      department: 'Antioquia',
      municipality: 'Medellín'
    }
  ];
  
  futureEvents.forEach(event => {
    const fileName = `2025-${event.month}-${event.day}_${event.city}_${event.name}.md`;
    const filePath = path.join(eventsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      let content = template.replace(/title:/, `title: ${event.title}`);
      content = content.replace(/eventDate:/, `eventDate: 2025-${event.month}-${event.day}`);
      content = content.replace(/organizer:/, `organizer: ${event.organizer}`);
      content = content.replace(/registrationDeadline:/, `registrationDeadline: 2025-${event.month}-${event.day}`);
      content = content.replace(/distances:\n  - 5k/, `distances:\n${event.distances.map(d => `  - ${d}`).join('\n')}`);
      content = content.replace(/municipality:/, `municipality: ${event.municipality}`);
      content = content.replace(/department:/, `department: ${event.department}`);
      content = content.replace(/draft: true/, 'draft: false');
      
      fs.writeFileSync(filePath, content);
      console.log(`✨ Creado nuevo evento: ${fileName}`);
    }
  });
}

// Ejecutar las funciones
console.log('🚀 Iniciando actualización de eventos...\n');
updateEventDates();
console.log('\n📅 Generando eventos futuros...\n');
generateFutureEvents();
