# 🚀### Para Desarrollo Local (.env.local)
```env
# IA (Solo desarrollo)
GROQ_API_KEY=tu_groq_api_key_aqui

# Email (Solo producción)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=tu-email@gmail.com
```- Despliegue en Vercel

## Variables de Entorno Requeridas

### Para Desarrollo Local (.env.local)
```env
# IA (Solo desarrollo)
GROQ_API_KEY=gsk_tu_api_key_aqui

# Email (Solo producción)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=tu-email@gmail.com
```

### Para Producción (Vercel Environment Variables)

1. **Ir a Vercel Dashboard** → Tu proyecto → Settings → Environment Variables

2. **Agregar las siguientes variables:**

| Variable | Valor | Entorno |
|----------|-------|---------|
| `GROQ_API_KEY` | `gsk_tu_api_key_de_groq` | Production, Preview |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | `service_tu_service_id` | Production, Preview |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | `template_tu_template_id` | Production, Preview |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | `tu_public_key_emailjs` | Production, Preview |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `tu-email@gmail.com` | Production, Preview |

## 🔧 Comandos de Despliegue

### Opción 1: Deploy desde GitHub (Recomendado)
```bash
# 1. Hacer commit de cambios
git add .
git commit -m "feat: sistema de imágenes y despliegue"
git push origin ai

# 2. Conectar repositorio en Vercel Dashboard
# 3. Configurar variables de entorno
# 4. Deploy automático
```

### Opción 2: Deploy directo con Vercel CLI
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy
vercel --prod
```

## 📋 Checklist de Despliegue

### ✅ Pre-despliegue
- [x] Configuración de imágenes SVG completada
- [x] Sistema de comentarios funcionando
- [x] Sistema híbrido local/producción implementado
- [x] Archivos de configuración creados
- [ ] Variables de entorno configuradas en Vercel
- [ ] Repositorio subido a GitHub

### ✅ Post-despliegue
- [ ] Verificar funcionamiento en producción
- [ ] Probar formulario de eventos (modo simple)
- [ ] Verificar envío de emails
- [ ] Probar sistema de comentarios
- [ ] Verificar carga de imágenes SVG

## 🌐 URLs de Testing

Una vez desplegado, el sitio estará disponible en:
- **Producción**: `https://aldebaran-[hash].vercel.app`
- **Preview**: URLs generadas automáticamente para cada branch

## 🔍 Debugging en Producción

### Logs de Vercel
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs --follow --function=api/enhance-event
```

### Variables a verificar:
1. **¿Las imágenes SVG cargan?** → `/images/defaults/event-default.svg`
2. **¿El formulario funciona?** → `/admin` (modo simple en producción)
3. **¿Los emails se envían?** → Verificar EmailJS dashboard
4. **¿Los comentarios funcionan?** → Crear un comentario de prueba

## 🚨 Solución de Problemas Comunes

### Error: "Image optimization timeout"
- **Causa**: Imágenes externas no cargan
- **Solución**: Las imágenes SVG locales ya están configuradas

### Error: "Function timeout"
- **Causa**: IA tarda mucho en responder
- **Solución**: En producción usa modo simple (sin IA)

### Error: "Email not sending"
- **Causa**: Variables de EmailJS mal configuradas
- **Solución**: Verificar variables en Vercel Dashboard

## 📞 Soporte

Si encuentras problemas:
1. Verificar logs en Vercel Dashboard
2. Comprobar variables de entorno
3. Revisar configuración de EmailJS
4. Probar en modo desarrollo local

---

**¡El sistema está listo para producción!** 🎉
