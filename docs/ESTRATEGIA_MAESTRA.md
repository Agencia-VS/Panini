# Estrategia Maestra — Bingo Mundialero Panini

> Documento de arquitectura, decisiones técnicas y plan de ejecución.
> Última actualización: 15 de abril de 2026

---

## 1. Visión del Producto

Aplicación React para un **"Bingo Mundialero"** de alto impacto visual con marca Panini, diseñada para ser operada en vivo por un host durante un evento. El público ve la pantalla principal mientras el host controla el flujo desde un panel discreto.

### Principios de Diseño

| Principio | Implicación |
|---|---|
| **Event-proof** | Cero dependencias de red en tiempo real. Todo corre local. |
| **Host-first** | El host nunca debe quedar bloqueado ni confundido. |
| **Animation-driven** | El estado solo cambia cuando la animación termina. Nunca antes. |
| **Recoverable** | Refresh del navegador = continuar donde se quedó. |
| **Auditable** | Cada acción queda registrada con timestamp. |

---

## 2. Stack Técnico

| Capa | Tecnología | Justificación |
|---|---|---|
| Build | **Vite 6 + React 19 + TypeScript** | Build instantáneo, HMR rápido, tipado estricto para prevenir bugs en evento |
| Estado | **useReducer + Context** | Flujo predecible, fácil de depurar, sin dependencias externas |
| Animación core | **GSAP + @gsap/react** | Control frame-a-frame, callbacks `onComplete`, limpieza automática de memoria |
| Transiciones UI | **Framer Motion** | Mount/unmount animados simples (modales, listas) |
| Audio | **Howler.js** | Sprites de audio, control de volumen, preload. React-friendly |
| Efectos | **canvas-confetti** | Ligero, sin canvas persistente, perfecto para momento "¡BINGO!" |
| Iconos | **lucide-react** | Tree-shakeable, consistente, sin peso innecesario |
| Persistencia | **localStorage** con hook custom | Sin servidor, instantáneo, suficiente para sesión de evento |

### Por qué Vite y NO Next.js

- No necesitamos SSR, rutas, ni API routes. Es una SPA de pantalla completa.
- Vite produce un bundle estático que se puede abrir desde un USB si falla la red.
- Menor superficie de error = menor riesgo en evento.

---

## 3. Arquitectura por Capas

```
┌─────────────────────────────────────────────────┐
│                  PRESENTACIÓN                    │
│  BallSpinner · RevealModal · AlbumGrid · Controls│
├─────────────────────────────────────────────────┤
│              ORQUESTACIÓN (Hooks)                │
│  useBingo · useSpinAnimation · usePreloader      │
│  useAudio · useLocalStorage · useKeyboard        │
├─────────────────────────────────────────────────┤
│              LÓGICA DE JUEGO (Pura)              │
│  bingoReducer · patternChecker · rng · audit     │
├─────────────────────────────────────────────────┤
│              INFRAESTRUCTURA                     │
│  Preload de assets · Persistencia · Recovery     │
└─────────────────────────────────────────────────┘
```

**Regla de oro:** Cada capa solo conoce la de abajo. Los componentes nunca tocan lógica de juego directamente; siempre pasan por hooks.

---

## 4. Modelo de Estado

### 4.1 Estado de Juego (serializable)

```typescript
interface GameState {
  schemaVersion: number;        // Para migraciones de localStorage
  available: Flag[];            // Banderas que aún no han salido
  history: DrawnFlag[];         // Banderas extraídas, en orden
  current: Flag | null;         // Última bandera extraída
  pattern: PatternType;         // 'linea' | 'columna' | 'cuadro' | 'bingo_full'
  winners: Winner[];            // Registro de ganadores
  auditLog: AuditEntry[];      // Registro de todas las acciones
}

interface Flag {
  id: string;                   // Ej: 'ARG', 'BRA'
  name: string;                 // Ej: 'Argentina'
  group: string;                // Ej: 'A', 'B', 'C'...
  imageSrc: string;             // Ruta precargada
}

interface DrawnFlag extends Flag {
  drawnAt: number;              // timestamp
  drawIndex: number;            // posición en la secuencia
}

interface AuditEntry {
  action: string;
  timestamp: number;
  payload?: unknown;
}

type PatternType = 'linea' | 'columna' | 'cuadro' | 'bingo_full';
```

### 4.2 Estado de UI (NO serializable)

```typescript
interface UIState {
  phase: 'loading' | 'idle' | 'spinning' | 'revealing' | 'celebrating';
  preloadProgress: number;      // 0 a 1
  preloadFailed: string[];      // IDs de banderas que fallaron
  modalOpen: boolean;
  audioEnabled: boolean;
  hostPanelOpen: boolean;
}
```

### 4.3 Separación de estados

El estado de **juego** se persiste en `localStorage`.
El estado de **UI** vive solo en memoria y se recalcula al montar.

Esto evita bugs como: "recargué la página y el modal quedó abierto" o "GSAP intentó retomar una animación muerta".

---

## 5. Reducer y Acciones

### 5.1 Acciones del Reducer

```typescript
type GameAction =
  | { type: 'DRAW_FLAG' }                        // Extrae bandera aleatoria
  | { type: 'UNDO_LAST' }                        // Revierte última extracción
  | { type: 'RESET_GAME' }                       // Reinicio total
  | { type: 'CHANGE_PATTERN'; pattern: PatternType }
  | { type: 'REGISTER_WINNER'; winner: Winner }
  | { type: 'HYDRATE'; state: GameState };        // Restaurar desde localStorage
```

### 5.2 Reglas del Reducer

```
DRAW_FLAG:
  - Precondición: available.length > 0
  - Selecciona índice aleatorio con crypto.getRandomValues
  - Mueve bandera de available → history + current
  - Agrega entrada al auditLog

UNDO_LAST:
  - Precondición: history.length > 0
  - Mueve última bandera de history → available
  - current = history[history.length - 1] ?? null
  - Agrega entrada al auditLog

RESET_GAME:
  - Restaura available al array original de 32
  - Limpia history, current, winners
  - Mantiene pattern
  - Agrega entrada al auditLog

CHANGE_PATTERN:
  - Solo actualiza pattern
  - NO toca banderas (se puede cambiar a mitad de juego)

HYDRATE:
  - Valida schemaVersion
  - Reemplaza estado completo si es compatible
  - Si es incompatible, descarta y usa initialState
```

---

## 6. Máquina de Fases (Anti-Race Condition)

Este es el punto más crítico para estabilidad en evento:

```
┌──────────┐   Spin click   ┌───────────┐   GSAP onComplete   ┌────────────┐
│   IDLE   │ ──────────────→│  SPINNING  │ ───────────────────→│  REVEALING │
└──────────┘                └───────────┘                      └────────────┘
     ↑                                                               │
     │                    Close modal / auto-timer                   │
     └──────────────────────────────────────────────────────────────┘

     Cualquier estado → CELEBRATING (cuando se detecta BINGO)
     CELEBRATING → IDLE (después de confetti + audio)
```

### Reglas inquebrantables

1. **Solo se puede hacer Spin si `phase === 'idle'`.**
2. **`dispatch({ type: 'DRAW_FLAG' })` solo se llama desde el `onComplete` de GSAP.** Nunca desde un click handler.
3. **El botón Spin se desactiva visualmente durante `spinning` y `revealing`.**
4. **Undo solo está disponible en `phase === 'idle'`.**

Esto elimina:
- Doble-clic que saca dos banderas.
- Estado desincronizado con la animación.
- Bandera que aparece en álbum antes de que el reveal termine.

---

## 7. Flujo Completo de un Giro

```
1. Host pulsa "Spin" (o tecla Space)
2. Guard: if (phase !== 'idle') return → ignora
3. setPhase('spinning')
4. Dispara audio: sonido de bolillero girando
5. Ejecuta gsap.timeline() en ref del BallSpinner
   └─ Rotaciones, rebotes, desaceleración (2-4s ajustable)
6. timeline.onComplete →
   a. dispatch({ type: 'DRAW_FLAG' })      // Estado cambia
   b. setPhase('revealing')                 // UI cambia
   c. Abre RevealModal con animación elástica
   d. Dispara audio: "revelación"
7. RevealModal se cierra (auto 3s o click del host)
   a. setPhase('idle')
   b. Si se detecta patrón ganador → setPhase('celebrating')
8. Si celebrating:
   a. canvas-confetti explosion
   b. Audio: "¡BINGO!" + ambiente estadio
   c. Después de 5s o click → setPhase('idle')
```

---

## 8. Sistema de Preloading

### Estrategia: Eager + Progressive

```typescript
// usePreloader.ts
async function preloadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  if (img.decode) {
    await img.decode(); // Decodifica en hilo separado si está disponible
  } else {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }
  return img;
}

// Usar Promise.allSettled para que 1 fallo NO bloquee las otras 31
const results = await Promise.allSettled(flags.map(f => preloadImage(f.imageSrc)));
```

### Reglas de Preload

- La app muestra pantalla de carga con barra de progreso hasta que se carga el **100%** (o 90% + fallback habilitado).
- Las banderas que fallen muestran un placeholder con el nombre del país.
- El botón "Spin" no se habilita hasta que el preload termine.
- También se precargan los sprites de audio con `Howler.js`.

---

## 9. Persistencia con localStorage

### Hook `useLocalStorage`

```typescript
function useLocalStorage<T>(key: string, initial: T, debounceMs = 200) {
  // Lee valor inicial del storage (o usa default)
  // Persiste cambios con debounce para no hacer writes en cada keystroke
  // Incluye schemaVersion para migraciones
  // Serializa solo datos planos (no refs, no funciones, no instancias GSAP)
}
```

### Qué se persiste
- ✅ `GameState` completo (available, history, current, pattern, winners, auditLog)
- ❌ `UIState` (se recalcula al montar)
- ❌ Referencias a DOM
- ❌ Instancias de animación

### Recuperación tras refresh
1. Al montar, se lee `localStorage`.
2. Se valida `schemaVersion`.
3. Si es válido → `dispatch({ type: 'HYDRATE', state })`.
4. Si es inválido o corrupto → `initialState` + log de warning.
5. La UI arranca en `phase: 'idle'` con el álbum ya poblado.

---

## 10. Componentes Principales

### `<BallSpinner />`

| Aspecto | Detalle |
|---|---|
| Ref | `useRef` para nodo DOM que GSAP manipula |
| Props | `onSpinComplete: () => void` |
| Animación | `gsap.timeline()` con rotación 3D, rebote elástico, ease personalizado |
| Duración | Configurable (default 3s), con variación aleatoria ±0.5s para que no sea repetitivo |
| Interacción | Deshabilitado durante spinning/revealing |

### `<RevealModal />`

| Aspecto | Detalle |
|---|---|
| Entrada | Animación elástica (`back.out(1.7)`) + escala desde 0 |
| Contenido | Bandera grande + nombre del país + grupo |
| Efecto | CSS shimmer (brillo blanco cruzando la imagen) |
| Salida | Auto-cierre en 3s o click/tecla del host |
| Audio | Sonido de "descubrir lámina" al abrir |

### `<AlbumGrid />`

| Aspecto | Detalle |
|---|---|
| Layout | Grid responsive, 8 columnas x 4 filas (32 banderas) |
| Estado visual | `isRevealed ? <Sticker color /> : <Sticker silueta />` |
| Animación | La nueva bandera entra con un mini-bounce al aparecer |
| Ordenamiento | Siempre por grupo/posición fija, no por orden de extracción |

### `<Sticker />`

| Aspecto | Detalle |
|---|---|
| Locked (no revelado) | `filter: grayscale(1) opacity(0.3)`, silueta genérica |
| Unlocked (revelado) | Color completo, `box-shadow` suave, efecto shimmer en hover |
| Look & feel | Bordes sutiles como lámina Panini real, ligera rotación aleatoria (±1°) |

### `<GameControls />`

| Aspecto | Detalle |
|---|---|
| Visibilidad | Panel lateral colapsable, activable con tecla `H` o botón |
| Botones | Spin, Undo, Reset, Cambiar Patrón, Toggle Audio, Toggle Fullscreen |
| Seguridad | Reset pide confirmación con doble click o modal |
| Estado | Muestra: banderas restantes, patrón activo, último sorteo |

---

## 11. Propuestas de Mejora (Más allá del brief)

### 11.1 Modo Ensayo

Un **"Rehearsal Mode"** que permite al host practicar el flujo completo antes del evento sin "gastar" el estado real. Al salir del ensayo, se descarta todo y se vuelve al estado limpio.

```typescript
type GameAction =
  | ...existing
  | { type: 'ENTER_REHEARSAL' }   // Snapshot del estado actual
  | { type: 'EXIT_REHEARSAL' };   // Restaura snapshot
```

**Por qué:** En eventos siempre hay un ensayo técnico. Sin este modo, hay que hacer Reset manual y rezar. Con esto, el ensayo es seguro.

### 11.2 Pantalla Dual (Host + Público)

Dos vistas desde la misma app:

- **`/`** → Vista pública (pantalla grande, sin controles).
- **`/?host=true`** → Vista host (con panel de control).

Se sincronizan via `BroadcastChannel` API (funciona entre pestañas del mismo navegador, sin servidor):

```typescript
const channel = new BroadcastChannel('panini-bingo');
channel.postMessage({ type: 'DRAW_FLAG', flag: currentFlag });
```

**Por qué:** El host puede tener su laptop con los controles y la pantalla grande muestra solo el show. Sin servidor, sin latencia, sin riesgo de red.

### 11.3 Cuenta Regresiva Pre-Spin

Antes de cada giro, un countdown breve (3-2-1) con animación y audio de estadio. Genera tensión y da tiempo al público de ubicarse.

```
[Host pulsa Spin] → [3...2...1...] → [Bolillero gira] → [Reveal]
```

Configurable: se puede desactivar si el host quiere ritmo rápido.

### 11.4 Historial Visual en Cinta

Además del álbum grid, una **cinta inferior** estilo "ticker" que muestra las últimas 5-8 banderas extraídas en orden cronológico. Útil para:
- El público que llega tarde y quiere saber qué salió.
- Verificación rápida sin buscar en el grid.

### 11.5 Efectos Especiales por Bandera

Algunas banderas podrían ser **"especiales"** (ej. la del país anfitrión) y disparar un efecto visual diferente al revelarse:
- Confetti con colores del país.
- Sonido especial (himno corto, grito de gol).
- Animación de fuego/estrellas.

```typescript
interface Flag {
  ...existing
  isSpecial?: boolean;
  specialEffect?: 'confetti' | 'fireworks' | 'golden';
  specialColors?: string[];  // Colores de la bandera para confetti
}
```

### 11.6 Scoreboard / Cartones

Si el evento tiene cartones reales, la app podría llevar un **contador de progreso por patrón**:
- "Faltan 3 banderas para que alguien pueda tener línea"
- "Ya salieron todas las del Grupo A"

Esto le da al host información para narrar el juego con más emoción.

### 11.7 Exportación de Resultados

Al finalizar el evento, botón para **exportar**:
- Lista completa de banderas en orden de extracción.
- Ganadores registrados.
- Duración total del juego.

Formato: JSON + PNG de resumen estilo "recap".

### 11.8 Temas Visuales

Dos o tres temas CSS que se puedan cambiar sin rebuild:
- **Panini Clásico:** Fondo oscuro, dorados, estilo álbum.
- **Estadio:** Fondo verde césped, marcador deportivo.
- **Neon:** Para eventos nocturnos o con poca luz.

Se implementa con CSS custom properties + un selector en el panel host.

### 11.9 Modo Accesibilidad para Streaming

Si el evento se transmite, agregar:
- Texto grande y alto contraste.
- Nombre del país siempre visible (no solo en el modal).
- Fuente que se lea bien a 1080p en streaming comprimido.

---

## 12. Mapa de Audio

| Momento | Archivo | Duración | Notas |
|---|---|---|---|
| Spin start | `spin-loop.mp3` | ~3s loop | Se sincroniza con duración de GSAP timeline |
| Reveal | `reveal-hit.mp3` | ~0.5s | Impacto corto, satisfactorio |
| Sticker placed | `sticker-slap.mp3` | ~0.3s | Cuando aparece en el álbum |
| Special flag | `special-fanfare.mp3` | ~1.5s | Solo para banderas especiales |
| Pattern win | `bingo-win.mp3` | ~3s | Triunfal, festivo |
| Countdown tick | `countdown-tick.mp3` | ~0.2s | Para cuenta regresiva pre-spin |
| Ambient | `stadium-ambient.mp3` | loop | Volumen bajo de fondo, toggle on/off |
| Undo | `undo-whoosh.mp3` | ~0.3s | Feedback sonoro de acción revertida |

Todos los audios se precargan con Howler.js como sprite para carga única.

---

## 13. Estructura de Carpetas

```
src/
├── app/
│   ├── App.tsx                    # Layout principal, proveedores
│   ├── App.css                    # Estilos globales + temas
│   └── main.tsx                   # Entry point Vite
│
├── components/
│   ├── BallSpinner/
│   │   ├── BallSpinner.tsx
│   │   └── BallSpinner.css
│   ├── RevealModal/
│   │   ├── RevealModal.tsx
│   │   └── RevealModal.css
│   ├── AlbumGrid/
│   │   ├── AlbumGrid.tsx
│   │   └── AlbumGrid.css
│   ├── Sticker/
│   │   ├── Sticker.tsx
│   │   └── Sticker.css
│   ├── GameControls/
│   │   ├── GameControls.tsx
│   │   └── GameControls.css
│   ├── HistoryTicker/
│   │   ├── HistoryTicker.tsx
│   │   └── HistoryTicker.css
│   ├── Countdown/
│   │   ├── Countdown.tsx
│   │   └── Countdown.css
│   └── PreloadScreen/
│       ├── PreloadScreen.tsx
│       └── PreloadScreen.css
│
├── hooks/
│   ├── useBingo.ts                # Hook principal: reducer + dispatch
│   ├── useSpinAnimation.ts        # Orquesta GSAP timeline + callbacks
│   ├── usePreloader.ts            # Precarga de imágenes y audio
│   ├── useLocalStorage.ts         # Persistencia con debounce
│   ├── useAudio.ts                # Wrapper de Howler.js
│   ├── useKeyboard.ts             # Atajos para host
│   ├── useBroadcast.ts            # BroadcastChannel para modo dual
│   └── usePhase.ts                # Máquina de fases de UI
│
├── logic/
│   ├── bingoReducer.ts            # Reducer puro, testeable
│   ├── bingoReducer.test.ts       # Tests unitarios del reducer
│   ├── patternChecker.ts          # Verifica si un patrón ganó
│   ├── patternChecker.test.ts
│   ├── rng.ts                     # Extracción aleatoria segura
│   └── audit.ts                   # Generación de entradas de auditoría
│
├── data/
│   ├── flags.ts                   # Array de 32 banderas con metadata
│   └── patterns.ts                # Definición de patrones de victoria
│
├── types/
│   └── index.ts                   # Todos los tipos TypeScript
│
├── assets/
│   ├── flags/                     # 32 imágenes PNG/WebP de banderas
│   ├── audio/                     # Archivos de audio
│   └── ui/                        # Fondos, texturas, logo Panini
│
└── styles/
    ├── themes.css                 # Variables CSS por tema
    └── animations.css             # Keyframes CSS (shimmer, etc.)
```

---

## 14. Plan de Ejecución (Orden de Implementación)

### Fase 1 — Cimientos (sin UI)

| # | Tarea | Output | Dependencia |
|---|---|---|---|
| 1.1 | Setup Vite + React + TS + ESLint | Proyecto que compila | — |
| 1.2 | Definir tipos en `types/index.ts` | Contratos tipados | — |
| 1.3 | Crear `data/flags.ts` con 32 banderas | Dataset completo | 1.2 |
| 1.4 | Implementar `bingoReducer.ts` | Reducer puro | 1.2 |
| 1.5 | Tests del reducer | Cobertura de todas las acciones | 1.4 |
| 1.6 | Implementar `rng.ts` y `patternChecker.ts` | Lógica auxiliar | 1.2 |
| 1.7 | Hook `useBingo.ts` | API consumible | 1.4, 1.6 |

### Fase 2 — Infraestructura

| # | Tarea | Output | Dependencia |
|---|---|---|---|
| 2.1 | Hook `useLocalStorage.ts` | Persistencia | 1.7 |
| 2.2 | Hook `usePreloader.ts` | Sistema de precarga | 1.3 |
| 2.3 | Hook `useAudio.ts` | Audio controlable | — |
| 2.4 | Hook `usePhase.ts` | Máquina de fases | 1.7 |
| 2.5 | `PreloadScreen` componente | Pantalla de carga | 2.2 |

### Fase 3 — Componentes Core

| # | Tarea | Output | Dependencia |
|---|---|---|---|
| 3.1 | `Sticker` componente | Lámina visual | 1.3 |
| 3.2 | `AlbumGrid` componente | Grid de 32 stickers | 3.1, 1.7 |
| 3.3 | `BallSpinner` + `useSpinAnimation` | Bolillero animado | 2.4 |
| 3.4 | `RevealModal` componente | Modal de revelación | 2.3 |
| 3.5 | `GameControls` componente | Panel del host | 1.7, 2.4 |
| 3.6 | `App.tsx` integración | Todo conectado | 3.1–3.5 |

### Fase 4 — Pulido

| # | Tarea | Output | Dependencia |
|---|---|---|---|
| 4.1 | Efecto shimmer CSS | Brillo en stickers | 3.1 |
| 4.2 | Countdown pre-spin | Tensión dramática | 3.3 |
| 4.3 | HistoryTicker | Cinta inferior | 1.7 |
| 4.4 | Confetti en victoria | Celebración | 3.4 |
| 4.5 | Temas visuales | Selector de tema | 3.6 |
| 4.6 | Atajos de teclado | `useKeyboard` | 3.5 |

### Fase 5 — Extras (si hay tiempo)

| # | Tarea | Output | Dependencia |
|---|---|---|---|
| 5.1 | Modo Ensayo | Rehearsal safe | 1.7 |
| 5.2 | Pantalla Dual con BroadcastChannel | Host ↔ Público | 3.6 |
| 5.3 | Banderas especiales | Efectos diferenciados | 3.4 |
| 5.4 | Exportación de resultados | JSON + resumen | 1.7 |

---

## 15. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Doble clic saca 2 banderas | Alta sin guard | Crítico | Máquina de fases + disable visual |
| Refresh pierde progreso | Media | Alto | localStorage + HYDRATE |
| Imagen no carga en evento | Baja | Medio | Preload con fallback + placeholder |
| Audio no suena | Media | Bajo | Toggle visible + no bloquear flujo |
| localStorage corrupto | Baja | Alto | Validación de schema + reset manual |
| Host se confunde con controles | Media | Medio | UI mínima + atajos + ensayo previo |
| GSAP y React compiten por DOM | Alta sin ref | Crítico | `useRef` exclusivo + `@gsap/react` |

---

## 16. Checklist Pre-Evento

- [ ] Build de producción sin warnings ni errors
- [ ] Probado en el navegador exacto del evento (Chrome/Edge)
- [ ] Probado en la resolución exacta de la pantalla del evento
- [ ] Todas las 48 banderas cargan correctamente
- [ ] Audio funciona (probar con speakers del evento)
- [ ] localStorage vacío → arranca limpio
- [ ] localStorage con datos → arranca desde donde quedó
- [ ] Undo funciona después de cada giro
- [ ] Reset pide confirmación y limpia todo
- [ ] Cambio de patrón no afecta banderas ya sorteadas
- [ ] Refresh del navegador en medio del juego → recupera estado
- [ ] Ensayo completo de 48 banderas sin bugs
- [ ] Segundo ensayo para verificar Reset
- [ ] Vista dual: host (/) y viewer (?role=viewer) sincronizados
- [ ] Pantalla completa (Fullscreen) funciona correctamente
- [ ] Exportar resultados genera JSON válido
- [ ] Los 3 temas visuales se aplican correctamente
- [ ] ErrorBoundary: simular error → botones Recargar y Reiniciar funcionan
- [ ] USB/backup con el build estático por si falla la máquina principal

---

*Este documento es la fuente de verdad del proyecto. Toda decisión técnica debe ser consistente con lo aquí definido.*
