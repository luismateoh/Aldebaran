# Variables de Entorno para Vercel (Producción)

Este documento lista todas las variables de entorno que deben configurarse en Vercel para el correcto funcionamiento de Aldebaran en producción.

## Variables Obligatorias

### Firebase Client (Público)
Estas variables son seguras para exponerse al cliente:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin SDK (Servidor)
⚠️ **CRÍTICO**: Estas variables son sensibles y solo deben usarse en el servidor:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

**Nota sobre FIREBASE_PRIVATE_KEY**: 
- En Vercel, asegúrate de incluir las comillas y los caracteres de escape `\n`
- Ejemplo: `"-----BEGIN PRIVATE KEY-----\nTu clave privada aquí\n-----END PRIVATE KEY-----\n"`

## Variables Opcionales

### AI Enhancement (Groq)
Solo necesaria si se usa la funcionalidad de AI para mejorar eventos:

```bash
GROQ_API_KEY=
```

### Email Notifications (EmailJS)
Para notificaciones por email de nuevas propuestas:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

## Instrucciones de Configuración en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings → Environment Variables
3. Agrega cada variable una por una
4. Para variables que comienzan con `NEXT_PUBLIC_`: selecciona todos los ambientes (Production, Preview, Development)
5. Para variables sensibles (FIREBASE_PRIVATE_KEY, etc.): solo selecciona Production y Preview
6. Redeploy tu aplicación después de agregar las variables

## Variables Detectadas como Faltantes

Basado en el análisis del código, estas son las variables críticas que deben estar configuradas:

### 🔴 Críticas para Funcionamiento Básico
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` 
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 🟡 Importantes para Funcionalidades Completas
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (para uploads de imágenes)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 🟢 Opcionales
- `GROQ_API_KEY` (AI enhancement)
- `NEXT_PUBLIC_EMAILJS_*` (notificaciones email)
- `NEXT_PUBLIC_ADMIN_EMAIL`

## Verificación

Para verificar que las variables están correctamente configuradas:

1. Revisa los logs de Vercel en tiempo real durante el deployment
2. Verifica que no haya errores relacionados con Firebase Auth
3. Prueba el login de administrador
4. Verifica que los eventos se carguen correctamente
5. Prueba la creación de comentarios con autenticación

## Problemas Comunes

### Firebase Private Key
- **Error**: "no "kid" claim found in token header"
- **Solución**: Verificar formato correcto de FIREBASE_PRIVATE_KEY con escapes `\n`

### Auth Domain
- **Error**: "auth/domain-mismatch" 
- **Solución**: Verificar NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN coincida con dominio configurado en Firebase Console

### Missing Project ID
- **Error**: "Firebase: No Firebase App"
- **Solución**: Verificar NEXT_PUBLIC_FIREBASE_PROJECT_ID está configurado

---

**Último update**: $(date)
**Mantenedor**: Luis Hincapie <luismateohm@gmail.com>