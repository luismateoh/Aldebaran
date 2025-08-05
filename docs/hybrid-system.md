# Sistema Híbrido: Desarrollo vs Producción

## 🎯 Concepto

Aldebaran usa un **sistema híbrido inteligente** que funciona diferente según el entorno:

### 🖥️ **Modo Desarrollo (Local)**
- **IA activada** con Groq para generar eventos enriquecidos
- **Descarga directa** de archivos Markdown
- **Comentarios locales** en archivos JSON
- **Control total** del administrador

### 🌐 **Modo Producción (Vercel)**
- **Formulario simple** para proponer eventos
- **Envío automático por email** al administrador
- **Sin acceso a IA** para usuarios públicos
- **Comentarios** funcionan normalmente

## 🔄 Flujo de Trabajo

### Para el Administrador (Tú):
1. **Desarrollo local:**
   - Usa `/admin` con IA para crear eventos ricos
   - Descarga y guarda en `/events/`
   - Haz commit y push para publicar

2. **Recibir propuestas:**
   - Los usuarios envían eventos simples
   - Recibes email con la información
   - Procesas localmente con IA
   - Publicas manualmente

### Para los Usuarios (Público):
1. **En el sitio público:**
   - Van a `/admin` (mismo formulario)
   - Completan información básica
   - Hacen clic en "📧 Enviar para Revisión"
   - ¡Listo! Tú recibes el email

## 📧 Configuración de Email

### EmailJS (Recomendado - Gratuito)
```bash
npm run setup-email
```

**Ventajas:**
- ✅ **200 emails gratis/mes**
- ✅ **No requiere servidor**
- ✅ **Funciona en Vercel**
- ✅ **Configuración simple**

### Variables de Entorno Necesarias:
```env
# Para IA (desarrollo)
GROQ_API_KEY=tu_groq_key

# Para emails (producción)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key
ADMIN_EMAIL=tu_email@gmail.com
```

## 🎨 Experiencia de Usuario

### Administrador (Local):
```
1. Formulario completo ✨
2. "🤖 Enriquecer con IA" ⚡
3. "📥 Descargar Markdown" 💾
4. Guardar en /events/ 📁
5. Git commit + push 🚀
```

### Usuario Público (Web):
```
1. Formulario simple 📝
2. "📧 Enviar para Revisión" 📤
3. ¡Enviado! ✅
4. Administrador procesa 👨‍💻
5. Evento publicado 🎉
```

## 🔧 Detección Automática

El sistema detecta automáticamente el entorno:

```javascript
const isDevelopment = process.env.NODE_ENV === 'development'

if (isDevelopment) {
  // Mostrar botones de IA + descarga
} else {
  // Mostrar botón de envío por email
}
```

## 🌟 Beneficios

### Para Ti (Administrador):
- ✅ **Control total** de calidad
- ✅ **IA solo en local** (sin costos)
- ✅ **Workflow eficiente**
- ✅ **Automatización donde importa**

### Para los Usuarios:
- ✅ **Formulario simple** y rápido
- ✅ **No necesitan cuentas**
- ✅ **Feedback inmediato**
- ✅ **Accesible desde móvil**

### Para el Sitio:
- ✅ **$0 de costos** operativos
- ✅ **Escalable** sin límites
- ✅ **Mantenible** fácilmente
- ✅ **SEO friendly**

## 🚀 Deploy en Vercel

1. **Configurar variables de entorno** en Vercel dashboard
2. **Deploy automático** en cada push
3. **EmailJS funciona** inmediatamente
4. **Comentarios funcionan** sin configuración extra

## 📊 Estadísticas Típicas

- **EmailJS:** 200 emails/mes gratis
- **Groq IA:** Ilimitado en desarrollo
- **Vercel:** Deploy gratis
- **Total cost:** **$0/mes** 🎉

## 🔮 Futuras Mejoras

- [ ] Panel admin web para aprobar eventos
- [ ] Notificaciones por Discord/Slack
- [ ] Sistema de moderación automática
- [ ] Analytics de eventos propuestos
- [ ] API para integraciones externas
