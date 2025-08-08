# 🔧 Configuración del Sistema de Administración

Este documento explica cómo configurar y usar el sistema de administración con persistencia en Firestore.

## ✅ Qué se Ha Implementado

### 🏗️ **Infraestructura**
- ✅ **Servicio Firebase Admin** (`lib/admin-firebase.ts`)
- ✅ **Colecciones Firestore**:
  - `administrators` - Lista de administradores
  - `systemSettings` - Configuraciones del sistema
- ✅ **APIs REST** completamente funcionales
- ✅ **Reglas de seguridad** en Firestore
- ✅ **Autenticación multi-admin**

### 🎯 **Funcionalidades**
- ✅ **Gestión de Administradores** (`/admin/administrators`)
- ✅ **Configuración Avanzada** (`/admin/settings`)  
- ✅ **Persistencia en Firestore**
- ✅ **Roles y permisos** (super_admin, admin)
- ✅ **Validaciones de seguridad**

## 🚀 Configuración Inicial

### 1. **Instalar Dependencias**
```bash
npm install firebase-admin
```

### 2. **Configurar Variables de Entorno**
Asegúrate de tener en tu `.env.local`:

```bash
# Firebase Admin SDK (para APIs del servidor)
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu-private-key\n-----END PRIVATE KEY-----\n"

# Firebase Client (para el frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-firebase

# ✅ Solo necesitas estas variables para Firebase
# Todas las demás configuraciones (AI, Email, etc.) se manejan desde el admin panel
# ¡Ya no necesitas variables de entorno para configurar la aplicación!
```

### 3. **Ejecutar Script de Inicialización**
```bash
node scripts/init-admin-system.js
```

Este script:
- ✅ Crea el super administrador inicial
- ✅ Configura settings por defecto
- ✅ Verifica la configuración

### 4. **Desplegar Reglas de Firestore**
```bash
firebase deploy --only firestore:rules
```

## 📚 Cómo Usar el Sistema

### 🔐 **Acceso Administrativo**

1. **Login inicial**: Visita `/admin` y haz login con Google
2. **Super Admin**: `luismateohm@gmail.com` (configurado por defecto)
3. **Agregar admins**: Ve a `/admin/administrators`

### 👥 **Gestión de Administradores**

#### Agregar Administrador:
```typescript
// Via UI en /admin/administrators
// O via API:
POST /api/admin/administrators
{
  "email": "nuevo@admin.com",
  "role": "admin" // o "super_admin"
}
```

#### Roles Disponibles:
- **`super_admin`**: Acceso completo (no se puede eliminar)
- **`admin`**: Acceso a gestión de eventos y configuraciones

### ⚙️ **Configuración del Sistema**

#### Configuraciones Disponibles (`/admin/settings`):

**🌐 Sitio Web:**
- Nombre del sitio
- Descripción
- URL principal

**📧 Notificaciones:**
- Email del administrador
- Configuración de EmailJS

**🤖 IA:**
- Toggle de mejora automática
- Estado de Groq API

**⚙️ Eventos:**
- Categoría por defecto
- Auto-aprobación de propuestas
- Límites de eventos por día

**🔒 Seguridad:**
- Rate limiting
- Límites de propuestas por hora

## 🗄️ Estructura de Datos

### **Colección `administrators`**
```typescript
{
  email: string                 // ID del documento
  displayName: string | null
  photoURL: string | null
  role: 'super_admin' | 'admin'
  addedBy: string              // Email del admin que lo agregó
  addedAt: Timestamp
  lastLogin?: Timestamp
  isActive: boolean
}
```

### **Colección `systemSettings`**
```typescript
{
  id: 'main'                   // Documento único
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  defaultEventCategory: string
  autoApproveProposals: boolean
  requireEventApproval: boolean
  maxEventsPerDay: number
  allowPublicEventCreation: boolean
  enableRateLimiting: boolean
  maxProposalsPerHour: number
  aiEnhancementEnabled: boolean
  lastUpdatedBy: string
  lastUpdatedAt: Timestamp
}
```

## 🔒 Seguridad

### **Reglas de Firestore**
- ✅ **Administradores**: Solo admins pueden ver/gestionar
- ✅ **Settings**: Solo admins pueden modificar
- ✅ **Eventos**: Lectura pública, escritura admin
- ✅ **Validaciones**: Email, roles, permisos

### **Protecciones Implementadas**
- ❌ No puedes eliminarte a ti mismo
- ❌ No puedes eliminar super admins (salvo otro super admin)
- ❌ Validación de emails en todos los endpoints
- ✅ Autenticación requerida para todas las operaciones admin

## 🚨 Solución de Problemas

### **Error: "Unauthorized"**
- Verifica que las reglas de Firestore estén desplegadas
- Asegúrate de que el administrador esté en la colección `administrators`
- Revisa que Firebase Admin SDK esté configurado correctamente

### **Error: "Administrator already exists"**
- El email ya está registrado como administrador
- Verifica en `/admin/administrators` la lista actual

### **Error de Firestore Rules**
- Despliega las reglas: `firebase deploy --only firestore:rules`
- Verifica que el proyecto de Firebase sea el correcto

### **Variables de Entorno**
- Revisa que todas las variables estén en `.env.local`
- Para producción, configúralas en tu plataforma de hosting

## 📈 Próximas Mejoras

- [ ] Invitaciones por email para nuevos admins
- [ ] Auditoría de acciones administrativas
- [ ] Configuraciones más granulares
- [ ] Backup/restore de configuraciones
- [ ] Notificaciones in-app

## 🆘 Soporte

Si tienes problemas:
1. Ejecuta el script de inicialización: `node scripts/init-admin-system.js`
2. Verifica la consola del navegador para errores
3. Revisa los logs de Firebase Console
4. Asegúrate de que todas las variables de entorno estén configuradas