---
name: harness
description: |
  Sistema multi-agente para tareas complejas. Use ONLY when the user needs to
  plan and execute a multi-step task using AI agents. Invokes the planner subagent
  (Kimi K2.7 Code via OpenCode Go) to decompose the task, then delegates steps to
  worker subagents (free models on OpenCode Zen). Use for:
  - "planifica y ejecuta X"
  - "usando el sistema multi-agente"
  - "harness"
  - "Kimi 2.7"
  - tareas que requieren análisis profundo + ejecución rápida
  - "quiero hacer X, planifícalo y ejecútalo"
---

# Harness Multi-Agente

Este skill implementa un sistema de orquestación multi-agente donde un modelo
**planificador** (Kimi K2.7 Code vía OpenCode Go) descompone tareas complejas y
modelos **workers** (DeepSeek V4 Flash Free vía OpenCode Zen) ejecutan cada paso.

> Nota: no se utiliza OpenRouter. El planner usa OpenCode Go (Kimi K2.7 Code) y
los workers usan los modelos gratuitos de OpenCode Zen.

## Flujo de trabajo

Sigue estos pasos EN ORDEN cuando el usuario invoque este skill:

### Paso 1: Planificar con DeepSeek R1

Delega la planificación al subagente `@planner`:

```
<task>Usa el subagente planner para descomponer esta tarea en pasos ejecutables:
[Tarea del usuario]
</task>
```

El planner devolverá un JSON con `objective`, `estimatedComplexity`, `context` y `steps[]`.

### Paso 2: Mostrar el plan al usuario

Presenta el plan de forma clara:
- Objetivo
- Complejidad estimada
- Pasos (con dependencias)

Pregunta si quiere proceder con la ejecución.

### Paso 3: Ejecutar pasos (si el usuario confirma)

Para cada paso, siguiendo el orden de dependencias:

**Si el paso requiere análisis/razonamiento profundo:**
```
<task>Usa el subagente worker-deepseek para ejecutar este paso:
[Título, descripción y resultado esperado del paso]
Contexto del plan: [context]
Resultados de pasos anteriores: [resultados si aplica]
</task>
```

**Si es un paso estándar:**
```
<task>Usa el subagente worker para ejecutar este paso:
[Título, descripción y resultado esperado del paso]
Contexto del plan: [context]
Resultados de pasos anteriores: [resultados si aplica]
</task>
```

### Paso 4: Recopilar resultados

Cuando todos los pasos estén completos, presenta un resumen con:
- Estado general (completado/fallido)
- Resultados de cada paso
- Próximos pasos sugeridos (si aplica)

## Notas importantes

- Usa `@planner` SOLO para la planificación inicial (Kimi K2.7 Code en OpenCode Go)
- Usa `@worker` para la mayoría de los pasos (DeepSeek V4 Flash Free en OpenCode Zen)
- Usa `@worker-deepseek` para pasos que requieren más razonamiento (DeepSeek V4 Flash Free en OpenCode Zen)
- Ejecuta pasos en paralelo cuando no tengan dependencias entre sí
- Si un paso falla, notifica al usuario y pregunta cómo proceder
- Mantén al usuario informado del progreso
- El contexto del proyecto está disponible en CLAUDE.md
