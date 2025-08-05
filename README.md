# Aldebaran 🏃‍♂️

Un sistema moderno y completo para eventos de atletismo en Colombia, construido con Next.js 14.

## 🚀 Características

### ✨ **Sistema de Eventos Automatizado**
- 📅 **Actualización automática** de eventos recurrentes
- 🤖 **IA gratuita** para generar contenido enriquecido (Groq)
- 📝 **Formulario intuitivo** para crear nuevos eventos
- 🔄 **Migración automática** de eventos 2024 → 2025

### 💬 **Comentarios de Comunidad**
- 🗨️ **Sistema propio** sin dependencias externas
- 📱 **Interfaz moderna** y responsive
- 🆓 **Completamente gratis** (archivos locales + Postgres)
- 🔧 **Sistema escalable** con Postgres en producción

### 🎨 **Interfaz Moderna**
- 🌓 **Tema claro/oscuro**
- 📱 **Completamente responsive**
- ⚡ **Componentes optimizados** con Radix UI
- 🎯 **UX centrada en el usuario**

## 🏁 Inicio Rápido

### 1. Instalación
```bash
git clone https://github.com/luismateoh/Aldebaran.git
cd Aldebaran
npm install
```

### 2. Configurar IA (Opcional pero Recomendado)
```bash
npm run setup-ai
# Sigue las instrucciones para obtener API key gratuita de Groq
```

### 3. Configurar Comentarios
```bash
npm run setup-comments
# Crea comentarios de ejemplo para probar el sistema
```

### 4. Ejecutar en Desarrollo
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

# Gestión de Eventos
npm run update-events      # Actualizar eventos 2024 → 2025
npm run new-event          # Script para crear eventos (CLI)

# Configuración
npm run setup-ai           # Configurar IA gratuita
npm run setup-comments     # Configurar sistema de comentarios

# Calidad de Código
npm run lint               # Linter
npm run typecheck          # Verificar tipos TypeScript
npm run format:write       # Formatear código
```

## 🎯 Uso del Sistema

### Crear Nuevo Evento
1. Ve a `/admin` en tu navegador
2. Completa el formulario con la información básica
3. Haz clic en "🤖 Enriquecer con IA" (si tienes API key configurada)
4. Descarga el archivo Markdown generado
5. Guárdalo en la carpeta `/events/`

### Gestionar Comentarios
- Los comentarios se guardan automáticamente en `/data/comments/`
- Para producción, migra a Postgres (lee `docs/comments-setup.md`)
- Sistema anti-spam básico incluido

## 🛠️ Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** Radix UI
- **IA:** Groq (gratuita) + OpenAI (opcional)
- **Comentarios:** Sistema propio + Postgres (opcional)
- **Hosting:** Vercel (capa gratuita)

## About this project

This project is a collection of athletics races, with the purpose of providing a platform for athletes and serves as a calendar of events for the general public in Colombia.
