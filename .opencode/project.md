# Project Context

## Identity

- Name: Aldebaran
- Path: /home/luxxo/Desktop/Projects/Aldebaran
- Status: active
- Priority: unknown
- Owner: unknown

## Outcome

Mantener una plataforma web funcional para descubrir y administrar eventos de atletismo en Colombia, con autenticación administrativa, eventos en Firebase, propuestas públicas, comentarios y una interfaz responsive desplegable en Vercel.

## Current State

- Confirmed: Repositorio Git en la rama `main`; aplicación Next.js con App Router, TypeScript, React 19, Tailwind CSS, Radix UI, Firebase/Firestore, next-pwa e integración opcional con Groq y EmailJS. `package.json` declara Next.js 15.4.10. README documenta comandos de desarrollo, configuración y despliegue. `npm run typecheck` y `npm run build` pasan; `npm run lint` termina con advertencias de hooks y clases Tailwind. El árbol de trabajo contiene numerosos cambios modificados y archivos no trackeados; no hay cambios staged según `git status`.
- Unknown: Prioridad y propietario del proyecto; objetivo inmediato; estado de las variables de entorno y servicios Firebase/Groq/EmailJS; si los cambios actuales deben consolidarse, dividirse o descartarse; fuente de verdad vigente para eventos y comentarios.
- Last reviewed: 2026-07-20

## Scope

### In scope

- Plataforma pública de eventos de atletismo y sus páginas responsive.
- Panel administrativo, autenticación, gestión de eventos y propuestas.
- Integraciones Firebase, IA opcional, email y PWA según configuración.

### Out of scope

- Definir una nueva prioridad, propietario o roadmap sin confirmación.
- Resolver en esta inicialización posibles divergencias entre la documentación restante y el código actual.

## Next Actions

1. Confirmar el objetivo inmediato, la prioridad, el propietario y el alcance de los cambios actualmente pendientes.
2. Revisar y corregir las advertencias de lint priorizando dependencias faltantes de hooks y después las clases Tailwind.
3. Revisar la documentación restante y definir la fuente de verdad de eventos/comentarios antes de consolidar cambios.

## Dependencies And Blockers

- Dependencies: Node.js/npm; Firebase y sus variables de entorno para las funciones backend; credenciales opcionales de Groq y EmailJS según el flujo utilizado.
- Blockers: No se conocen bloqueos técnicos confirmados; la validación funcional de integraciones sigue condicionada por las variables de entorno y por aclarar el destino de los cambios no comprometidos.

## Decisions

- Date: 2026-07-20
  Decision: Registrar el proyecto como `active` y dejar prioridad/propietario como `unknown`.
  Reason: El repositorio tiene desarrollo reciente y cambios activos, pero no existe información confirmada sobre prioridad u ownership.

## Definition Of Done

- El objetivo inmediato queda confirmado y el contexto técnico/documental refleja la fuente de verdad actual.
- Las comprobaciones de tipos, lint y build relevantes pasan, o sus fallos quedan documentados con causa.
- Los cambios aprobados quedan implementados y el árbol de trabajo tiene un estado intencional y revisable.

## Notes

- `README.md` y `package.json` describen Next.js 15 y Firebase. `CLAUDE.md` fue eliminado por no aplicar al proyecto; también se retiró su referencia de `opencode.json`.
- `npm run lint` no falla, pero deja advertencias preexistentes sobre dependencias de hooks y convenciones Tailwind.
- El estado Git inicial fue revisado en `main` con cambios modificados y no trackeados preexistentes; no se alteraron ni revirtieron.
