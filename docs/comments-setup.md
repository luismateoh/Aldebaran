# Sistema de Comentarios - Configuración

## 🎯 Configuración Actual: Sistema de Archivos (Gratuito)

Actualmente los comentarios se guardan en archivos JSON locales. 
Esto funciona perfectamente para desarrollo y sitios pequeños.

## 🚀 Para migrar a Vercel KV (Recomendado para producción):

### 1. Activar Vercel KV
- Ve a tu dashboard de Vercel
- En tu proyecto, ve a "Storage" 
- Crea una nueva base de datos KV (gratis hasta 30k requests/mes)

### 2. Configurar variables de entorno
Agrega a tu .env.local:
```
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here  
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here
```

### 3. Instalar dependencia
```bash
npm install @vercel/kv
```

### 4. Actualizar el API endpoint
El archivo `/app/api/comments/route.ts` tiene comentarios sobre cómo migrar.

## 🎨 Otras opciones disponibles:

### Supabase (Alternativa completa)
- Base de datos PostgreSQL gratuita
- Autenticación incluida  
- 50k filas gratis/mes

### Firebase Firestore
- Base de datos NoSQL
- Tier gratuito generoso
- Fácil de configurar

### FormSpree + EmailJS
- Para sitios completamente estáticos
- Comentarios vía email
- 100% gratis

## 📊 Límites actuales (Sistema de archivos):
- ✅ Comentarios ilimitados
- ✅ Sin costos
- ✅ Funciona en Vercel
- ⚠️ No hay moderación automática avanzada
- ⚠️ Búsqueda limitada

## 🔧 Mejoras futuras disponibles:
- [ ] Moderación automática con IA
- [ ] Sistema de "me gusta"
- [ ] Respuestas anidadas
- [ ] Notificaciones por email
- [ ] Panel de administración
