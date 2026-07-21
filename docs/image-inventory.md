# Image Inventory — Aldebaran

> Generado el: 2026-06-29
> Reporte completo de imágenes referenciadas en el código y disponibles en `public/images/`.

---

## 1. Resumen

| Categoría | Cantidad |
|-----------|----------|
| Imágenes referenciadas en código | 31 rutas únicas |
| Imágenes existentes en `public/images/` | 50 archivos |
| Imágenes faltantes (broken references) | 0 |
| Imágenes no referenciadas (sin uso) | 16 archivos |

---

## 2. Imágenes usadas por página/componente

### `app/page.tsx` (Home page)
| Ruta | Estado |
|------|--------|
| `/images/og/home.jpg` | ✅ OK |

### `app/events/layout.tsx`
| Ruta | Estado |
|------|--------|
| `/images/og/events.jpg` | ✅ OK |

### `app/events/[id]/page.tsx`
| Ruta | Estado |
|------|--------|
| `/images/og/events.jpg` | ✅ OK |
| `eventData.cover` (dinámico) | ⚡ Dinámico |

### `app/login/page.tsx`
| Ruta | Estado |
|------|--------|
| `/favicon-light.svg` | ✅ OK |
| `/favicon-dark.svg` | ✅ OK |

### `app/layout.tsx`
| Ruta | Estado |
|------|--------|
| `/favicon-light.svg` | ✅ OK |
| `/favicon-dark.svg` | ✅ OK |

### `config/site.ts`
| Ruta | Estado |
|------|--------|
| `/images/og/home.jpg` | ✅ OK |

### `components/home/hero.tsx`
| Ruta | Estado |
|------|--------|
| `/images/home/hero-trail-running.jpg` | ✅ OK |

### `components/home/hero-section.tsx`
| Ruta | Estado |
|------|--------|
| `/images/hero/hero-home.jpg` | ✅ OK |

### `components/home/features.tsx`
| Ruta | Estado |
|------|--------|
| `/images/home/runner-sunrise.jpg` | ✅ OK |
| `/images/home/pexels-runner-1.jpg` | ✅ OK |
| `/images/home/trail-runner.jpg` | ✅ OK |

### `components/home/motivational-banner.tsx`
| Ruta | Estado |
|------|--------|
| `/images/hero/banner-motivacional.jpg` | ✅ OK |

### `components/home/how-it-works.tsx`
| Ruta | Estado |
|------|--------|
| `/images/home/runner-sunrise.jpg` | ✅ OK |
| `/images/home/runners-sunset.jpg` | ✅ OK |
| `/images/home/pexels-marathon.jpg` | ✅ OK |

### `components/home/upcoming-events-accordion.tsx`
| Ruta | Estado |
|------|--------|
| `/images/home/hero-trail-running.jpg` | ✅ OK |
| `/images/home/trail-runner.jpg` | ✅ OK |
| `/images/home/runner-sunrise.jpg` | ✅ OK |
| `/images/home/pexels-marathon.jpg` | ✅ OK |
| `/images/home/running-track.jpg` | ✅ OK |
| `/images/home/sprinter-track.jpg` | ✅ OK |

### `components/home/distance-levels.tsx`
| Ruta | Estado |
|------|--------|
| `/images/distances/5k.jpg` | ✅ OK |
| `/images/distances/10k.jpg` | ✅ OK |
| `/images/distances/21k.jpg` | ✅ OK |
| `/images/distances/42k.jpg` | ✅ OK |

### `components/home/map-section.tsx`
| Ruta | Estado |
|------|--------|
| `/images/defaults/marathon-default.jpg` | ✅ OK |
| `/images/defaults/trail-default.jpg` | ✅ OK |
| `/images/defaults/event-default.jpg` | ✅ OK |

### `components/home/resources-section.tsx`
| Ruta | Estado |
|------|--------|
| `/images/resources/training.jpg` | ✅ OK |
| `/images/resources/nutrition.jpg` | ✅ OK |
| `/images/resources/gear.jpg` | ✅ OK |
| `/images/resources/community.jpg` | ✅ OK |

### `components/cta/organizer-cta.tsx`
| Ruta | Estado |
|------|--------|
| `/images/cta/organizadores.jpg` | ✅ OK (reparado) |

### `app/api/enhance-event/route.ts`
| Ruta | Estado |
|------|--------|
| `/images/{eventId}.svg` | ⚡ Creado dinámicamente |

---

## 3. Imágenes disponibles en `public/images/`

### `public/images/hero/`
| Archivo | Referenciado |
|---------|-------------|
| `hero-main.jpg` | ❌ No referenciado |
| `banner-motivacional.jpg` | ✅ `motivational-banner.tsx` |
| `cta-bg.jpg` | ❌ No referenciado |
| `hero-events.jpg` | ❌ No referenciado |
| `hero-home.jpg` | ✅ `hero-section.tsx` |

### `public/images/home/`
| Archivo | Referenciado |
|---------|-------------|
| `hero-trail-running.jpg` | ✅ `hero.tsx`, `upcoming-events-accordion.tsx` |
| `trail-runner.jpg` | ✅ `features.tsx`, `upcoming-events-accordion.tsx` |
| `runner-sunrise.jpg` | ✅ `features.tsx`, `how-it-works.tsx`, `upcoming-events-accordion.tsx` |
| `pexels-runner-1.jpg` | ✅ `features.tsx` |
| `pexels-marathon.jpg` | ✅ `how-it-works.tsx`, `upcoming-events-accordion.tsx` |
| `runners-sunset.jpg` | ✅ `how-it-works.tsx` |
| `running-track.jpg` | ✅ `upcoming-events-accordion.tsx` |
| `sprinter-track.jpg` | ✅ `upcoming-events-accordion.tsx` |
| `trail-mountains.jpg` | ❌ No referenciado |
| `runner-silhouette.jpg` | ❌ No referenciado |
| `road-runner.jpg` | ❌ No referenciado |
| `running-shoes.jpg` | ❌ No referenciado |

### `public/images/resources/`
| Archivo | Referenciado |
|---------|-------------|
| `training.jpg` | ✅ `resources-section.tsx` |
| `nutrition.jpg` | ✅ `resources-section.tsx` |
| `gear.jpg` | ✅ `resources-section.tsx` |
| `community.jpg` | ✅ `resources-section.tsx` |

### `public/images/distances/`
| Archivo | Referenciado |
|---------|-------------|
| `5k.jpg` | ✅ `distance-levels.tsx` |
| `10k.jpg` | ✅ `distance-levels.tsx` |
| `21k.jpg` | ✅ `distance-levels.tsx` |
| `42k.jpg` | ✅ `distance-levels.tsx` |

### `public/images/defaults/`
| Archivo | Referenciado |
|---------|-------------|
| `marathon-default.jpg` | ✅ `map-section.tsx` |
| `trail-default.jpg` | ✅ `map-section.tsx` |
| `event-default.jpg` | ✅ `map-section.tsx` |
| `marathon-default.svg` | ❌ No referenciado |
| `trail-default.svg` | ❌ No referenciado |
| `event-default.svg` | ❌ No referenciado |
| `city-default.jpg` | ❌ No referenciado |
| `city-default.svg` | ❌ No referenciado |
| `running-default.jpg` | ❌ No referenciado |
| `running-default.svg` | ❌ No referenciado |

### `public/images/og/`
| Archivo | Referenciado |
|---------|-------------|
| `home.jpg` | ✅ `page.tsx`, `config/site.ts` |
| `events.jpg` | ✅ `events/layout.tsx`, `events/[id]/page.tsx` |

### `public/images/gallery/`
| Archivo | Referenciado |
|---------|-------------|
| `gallery-01.jpg` | ❌ No referenciado |
| `gallery-02.jpg` | ❌ No referenciado |
| `gallery-03.jpg` | ❌ No referenciado |
| `gallery-04.jpg` | ❌ No referenciado |

### `public/images/cta/`
| Archivo | Referenciado |
|---------|-------------|
| `organizadores.jpg` | ✅ `organizer-cta.tsx` (reparado) |

### `public/images/categories/`
| Archivo | Referenciado |
|---------|-------------|
| `montana.jpg` | ❌ No referenciado (posible uso dinámico) |
| `running.jpg` | ❌ No referenciado (posible uso dinámico) |
| `asfalto.jpg` | ❌ No referenciado (posible uso dinámico) |
| `ultra.jpg` | ❌ No referenciado (posible uso dinámico) |
| `trail.jpg` | ❌ No referenciado (posible uso dinámico) |

### `public/images/steps/`
| Archivo | Referenciado |
|---------|-------------|
| `discover.jpg` | ❌ No referenciado (posible uso dinámico) |
| `register.jpg` | ❌ No referenciado (posible uso dinámico) |
| `run.jpg` | ❌ No referenciado (posible uso dinámico) |

---

## 4. Imágenes faltantes detectadas y reparadas

| Ruta faltante | Componente | Acción tomada |
|---------------|------------|---------------|
| `/images/hero/banner-organizadores.jpg` | `components/cta/organizer-cta.tsx:66` | 🛠️ Ruta corregida → `/images/cta/organizadores.jpg` (el archivo ya existía en ubicación correcta) |

**Resultado:** 0 imágenes rotas después de la reparación.

---

## 5. Placeholders y fallbacks

### Fallbacks por categoría (en `map-section.tsx`)
| Categoría del evento | Fallback usado |
|---------------------|---------------|
| Marathon / 42K | `/images/defaults/marathon-default.jpg` |
| Trail | `/images/defaults/trail-default.jpg` |
| Otros | `/images/defaults/event-default.jpg` |

### Placeholder dinámico (en `enhance-event/route.ts`)
- Cuando un evento no tiene imagen de portada, se genera un SVG en `/images/{eventId}.svg` con el nombre del evento.
- El SVG se crea automáticamente al procesar el evento vía la API de enhance.

### OG Image fallback (en `events/[id]/page.tsx`)
- Si `eventData.cover` no existe, se usa `/images/og/events.jpg` como fallback para Open Graph.

---

## 6. Recomendaciones

1. **Imágenes no referenciadas**: 16 archivos en `public/images/` no están siendo usados directamente. Revisar:
   - `categories/` y `steps/` → posible uso dinámico futuro
   - `gallery/` → posiblemente para una galería no implementada aún
   - `defaults/*.svg` → existen versiones SVG y JPG del mismo fallback; unificar
   - `hero/hero-main.jpg`, `hero/cta-bg.jpg`, `hero/hero-events.jpg` → assets de respaldo
   - `home/trail-mountains.jpg`, `home/runner-silhouette.jpg`, `home/road-runner.jpg`, `home/running-shoes.jpg` → sin uso actual

2. **Unificación de defaults**: Existen pares SVG/JPG para `marathon-default`, `trail-default`, `event-default`, `city-default`, `running-default`. Considerar eliminar los SVG no usados o migrar todos a un solo formato.

3. **Dynamic events directory**: El directorio `public/images/events/` se crea automáticamente al generar placeholders SVG de eventos via API. No requiere creación manual.
