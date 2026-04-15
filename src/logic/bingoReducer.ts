import type { GameState, GameAction, DrawnFlag } from '../types';
import { SCHEMA_VERSION } from '../types';
import { allFlags } from '../data/flags';
import { secureRandomIndex } from './rng';
import { createAuditEntry } from './audit';

// ─── Estado inicial ────────────────────────────────────────

export const initialGameState: GameState = {
  schemaVersion: SCHEMA_VERSION,
  available: [...allFlags],
  history: [],
  current: null,
  pattern: 'linea',
  winners: [],
  auditLog: [],
  rehearsalSnapshot: null,
};

// ─── Reducer ───────────────────────────────────────────────

export function bingoReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DRAW_FLAG': {
      if (state.available.length === 0) return state;

      const index = secureRandomIndex(state.available.length);
      const flag = state.available[index];
      const drawnFlag: DrawnFlag = {
        ...flag,
        drawnAt: Date.now(),
        drawIndex: state.history.length,
      };

      return {
        ...state,
        available: state.available.filter((_, i) => i !== index),
        history: [...state.history, drawnFlag],
        current: drawnFlag,
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'UNDO_LAST': {
      if (state.history.length === 0) return state;

      const lastDrawn = state.history[state.history.length - 1];
      // Restaurar la bandera original (sin campos DrawnFlag)
      const restoredFlag = allFlags.find((f) => f.id === lastDrawn.id);
      if (!restoredFlag) return state;

      const newHistory = state.history.slice(0, -1);

      return {
        ...state,
        available: [...state.available, restoredFlag],
        history: newHistory,
        current: newHistory.length > 0 ? newHistory[newHistory.length - 1] : null,
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialGameState,
        pattern: state.pattern, // Mantener patrón actual
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'CHANGE_PATTERN': {
      return {
        ...state,
        pattern: action.pattern,
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'REGISTER_WINNER': {
      return {
        ...state,
        winners: [...state.winners, action.winner],
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'HYDRATE': {
      if (action.state.schemaVersion !== SCHEMA_VERSION) {
        console.warn(
          `[Bingo] Schema version mismatch: expected ${SCHEMA_VERSION}, got ${action.state.schemaVersion}. Using initial state.`,
        );
        return initialGameState;
      }
      return action.state;
    }

    case 'ENTER_REHEARSAL': {
      // Ya estamos en ensayo → ignorar
      if (state.rehearsalSnapshot) return state;
      return {
        ...initialGameState,
        pattern: state.pattern,
        rehearsalSnapshot: { ...state, rehearsalSnapshot: null },
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    case 'EXIT_REHEARSAL': {
      if (!state.rehearsalSnapshot) return state;
      return {
        ...state.rehearsalSnapshot,
        auditLog: [...state.auditLog, createAuditEntry(action)],
      };
    }

    default:
      return state;
  }
}
