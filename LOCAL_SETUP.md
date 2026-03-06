# Guía de Configuración Local

Esta guía estandariza la configuración local de Firebase, Vercel y GitHub.

## 1) Instalar dependencias

```bash
npm install
```

Si VS Code muestra errores de Tailwind como `Can't resolve 'tailwindcss/...'`, normalmente faltan dependencias.

## 2) Crear archivo de entorno local

```bash
cp .env.example .env.local
```

Luego completa en `.env.local` todas las variables requeridas de Firebase.

## 3) Configurar login local con Firebase

### Configuración requerida en Firebase Console
- Authentication → Sign-in method → enable **Google** provider.
- Authentication → Settings → Authorized domains → include `localhost`.

### Variables de entorno requeridas
- `NEXT_PUBLIC_FIREBASE_*` client keys.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

### Emuladores de Firebase (opcional)
```bash
npm run firebase:emulators
```

## 4) Inicialización admin (primer uso)

```bash
node scripts/init-admin-system.js
```

Esto crea documentos base de administración y configuración en Firestore.

## 5) Vincular proyecto con Vercel (opcional, recomendado)

```bash
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env pull .env.local.vercel
```

Después integra manualmente en `.env.local` cualquier variable faltante.

## 6) Autenticación GitHub y flujo de ramas

```bash
gh auth login
git fetch origin
```

Recomendación de ramas:
- Mantener `main` como rama estable.
- Mantener `develop` en fast-forward respecto a `main` cuando quieras misma base.

## 7) Validar estado del proyecto

```bash
npm run typecheck
npm run lint
npm run dev
```

Nota: pueden aparecer warnings/errores preexistentes no relacionados con setup local.
