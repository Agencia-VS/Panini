// ─── Modelos del dominio ────────────────────────────────────

export interface Flag {
  id: string;
  name: string;
  group: string;
  imageSrc: string;
  isSpecial?: boolean;
  specialEffect?: 'confetti' | 'fireworks' | 'golden';
  specialColors?: string[];
}

export interface DrawnFlag extends Flag {
  drawnAt: number;
  drawIndex: number;
}

export interface Winner {
  id: string;
  name: string;
  pattern: PatternType;
  timestamp: number;
}

export interface AuditEntry {
  action: string;
  timestamp: number;
  payload?: unknown;
}

// ─── Estado de juego (serializable → localStorage) ─────────

export interface GameState {
  schemaVersion: number;
  available: Flag[];
  history: DrawnFlag[];
  current: DrawnFlag | null;
  pattern: PatternType;
  winners: Winner[];
  auditLog: AuditEntry[];
  rehearsalSnapshot: GameState | null;
}

// ─── Estado de UI (no serializable) ────────────────────────

export type Phase =
  | 'loading'
  | 'idle'
  | 'spinning'
  | 'revealing'
  | 'celebrating';

// ─── Patrones de victoria ──────────────────────────────────

export type PatternType = 'linea' | 'columna' | 'ele' | 'cuadro' | 'bingo_full';

// ─── Acciones del reducer ──────────────────────────────────

export type GameAction =
  | { type: 'DRAW_FLAG' }
  | { type: 'UNDO_LAST' }
  | { type: 'RESET_GAME' }
  | { type: 'CHANGE_PATTERN'; pattern: PatternType }
  | { type: 'REGISTER_WINNER'; winner: Winner }
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'ENTER_REHEARSAL' }
  | { type: 'EXIT_REHEARSAL' };

// ─── Constantes ────────────────────────────────────────────

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'panini-bingo-state';
export const TOTAL_FLAGS = 16;
export const GRID_COLS = 4;
export const GRID_ROWS = 4;
