# Aldebaran 🏃‍♂️

Una plataforma moderna para eventos de atletismo en Colombia, construida con Next.js 14 y Firebase.

## 🚀 Características

### ✨ **Sistema de Eventos con Firebase**
- 🔥 **Firebase Firestore** como base de datos principal
- 🤖 **IA gratuita** para generar contenido enriquecido (Groq)
- 📝 **Panel de administración** intuitivo
- 📅 **Filtrado automático** de eventos (solo futuros)

### 💬 **Sistema de Comentarios**
- 🗨️ **Sistema basado en archivos** sin dependencias externas
- 📱 **Interfaz moderna** y responsive
- 🔧 **Moderación básica** incluida

### 🎨 **Interfaz Moderna**
- 🌓 **Tema claro/oscuro**
- 📱 **Completamente responsive**
- ⚡ **Componentes optimizados** con Radix UI
- 🎯 **PWA** con soporte offline

## 🏁 Inicio Rápido

### 1. Instalación
```bash
git clone https://github.com/luismateoh/Aldebaran.git
cd Aldebaran
npm install
```

### 2. Configurar Firebase
Crea un archivo `.env.local` con tus credenciales de Firebase:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Configurar IA (Opcional)
Para desarrollo con IA, añade a tu `.env.local`:
```bash
GROQ_API_KEY=gsk_tu_groq_key_aqui
```

### 4. Configurar EmailJS (Producción)
Para notificaciones por email, añade:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### 5. Ejecutar en Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

## 📚 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build              # Build de producción
npm run start              # Servidor de producción
npm run preview            # Build + start local

# Calidad de Código
npm run lint               # ESLint
npm run lint:fix           # Corregir issues automáticamente
npm run typecheck          # Verificar tipos TypeScript
npm run format:write       # Formatear código con Prettier
npm run format:check       # Verificar formato

# Firebase (si usas Firebase)
npm run firebase:emulators # Iniciar emuladores Firebase
npm run firebase:deploy    # Desplegar a Firebase
```

## 🎯 Uso del Sistema

### Panel de Administración
1. Ve a `/admin` en tu navegador
2. Usa las "Acciones Rápidas":
   - **Gestionar Propuestas**: Revisar eventos propuestos
   - **Administrar Eventos**: Gestión completa de eventos

### Crear Nuevo Evento
1. Accede al panel de administración
2. Completa el formulario con la información del evento
3. Usa la IA para enriquecer el contenido (si está configurada)
4. El evento se guarda automáticamente en Firebase

### Proponer Eventos
- Los usuarios pueden proponer eventos en `/proponer`
- Sistema de notificaciones por email al administrador

## 🛠️ Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Base de Datos:** Firebase Firestore
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** Radix UI
- **IA:** Groq (gratuita)
- **Email:** EmailJS
- **Hosting:** Vercel
- **PWA:** next-pwa

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Vercel manejará automáticamente el build y despliegue

### Variables de Entorno para Producción
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

## 📁 Estructura del Proyecto

```
Aldebaran/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel de administración
│   ├── api/               # API routes
│   ├── events/            # Páginas de eventos
│   └── proponer/          # Formulario de propuestas
├── components/            # Componentes React
├── lib/                   # Utilidades y servicios
├── hooks/                 # Custom React hooks
├── data/                  # Datos locales (comentarios)
├── public/                # Assets estáticos
└── scripts/               # Scripts de utilidad
```

## 📝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## About this project

This project is a collection of athletics races, with the purpose of providing a platform for athletes and serves as a calendar of events for the general public in Colombia.